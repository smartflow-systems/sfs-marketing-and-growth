"""
File Storage Module
Supports AWS S3 and Cloudinary for media uploads
"""

import os
import logging
import mimetypes
from typing import Optional, BinaryIO, Dict
from datetime import datetime, timedelta
from io import BytesIO

logger = logging.getLogger(__name__)

# Try importing cloud storage libraries
try:
    import boto3
    from botocore.exceptions import ClientError
    S3_AVAILABLE = True
except ImportError:
    S3_AVAILABLE = False
    logger.warning("boto3 not available. Install with: pip install boto3")

try:
    import cloudinary
    import cloudinary.uploader
    import cloudinary.api
    CLOUDINARY_AVAILABLE = True
except ImportError:
    CLOUDINARY_AVAILABLE = False
    logger.warning("cloudinary not available. Install with: pip install cloudinary")


class StorageBackend:
    """Base storage backend interface"""

    def upload(self, file: BinaryIO, filename: str, folder: str = "", **kwargs) -> Dict:
        """Upload file and return URL"""
        raise NotImplementedError

    def delete(self, file_id: str) -> bool:
        """Delete file"""
        raise NotImplementedError

    def get_url(self, file_id: str, expires_in: Optional[int] = None) -> str:
        """Get public or signed URL"""
        raise NotImplementedError


class S3Storage(StorageBackend):
    """AWS S3 storage backend"""

    def __init__(self):
        if not S3_AVAILABLE:
            raise RuntimeError("boto3 not installed")

        self.bucket_name = os.environ.get("AWS_S3_BUCKET")
        self.region = os.environ.get("AWS_REGION", "us-east-1")
        self.access_key = os.environ.get("AWS_ACCESS_KEY_ID")
        self.secret_key = os.environ.get("AWS_SECRET_ACCESS_KEY")

        if not all([self.bucket_name, self.access_key, self.secret_key]):
            raise RuntimeError("AWS S3 credentials not configured")

        self.s3_client = boto3.client(
            's3',
            region_name=self.region,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key
        )

        logger.info(f"S3 storage initialized for bucket: {self.bucket_name}")

    def upload(
        self,
        file: BinaryIO,
        filename: str,
        folder: str = "",
        content_type: Optional[str] = None,
        public: bool = True
    ) -> Dict:
        """
        Upload file to S3

        Args:
            file: File object
            filename: Target filename
            folder: Optional folder path
            content_type: MIME type (auto-detected if None)
            public: Make file publicly accessible

        Returns:
            Dict with 'url', 'key', 'bucket'
        """
        # Build S3 key
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        safe_filename = filename.replace(' ', '_')
        key = f"{folder}/{timestamp}_{safe_filename}" if folder else f"{timestamp}_{safe_filename}"

        # Detect content type
        if content_type is None:
            content_type, _ = mimetypes.guess_type(filename)
            if content_type is None:
                content_type = 'application/octet-stream'

        # Upload to S3
        try:
            extra_args = {
                'ContentType': content_type
            }

            if public:
                extra_args['ACL'] = 'public-read'

            self.s3_client.upload_fileobj(
                file,
                self.bucket_name,
                key,
                ExtraArgs=extra_args
            )

            # Generate URL
            if public:
                url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{key}"
            else:
                url = self.get_url(key, expires_in=3600)

            logger.info(f"Uploaded to S3: {key}")

            return {
                "url": url,
                "key": key,
                "bucket": self.bucket_name,
                "backend": "s3"
            }

        except ClientError as e:
            logger.error(f"S3 upload error: {e}")
            raise

    def delete(self, key: str) -> bool:
        """Delete file from S3"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            logger.info(f"Deleted from S3: {key}")
            return True
        except ClientError as e:
            logger.error(f"S3 delete error: {e}")
            return False

    def get_url(self, key: str, expires_in: Optional[int] = None) -> str:
        """
        Get URL for file

        Args:
            key: S3 object key
            expires_in: Expiration time in seconds (for signed URLs)

        Returns:
            Public or signed URL
        """
        if expires_in:
            # Generate presigned URL
            try:
                url = self.s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.bucket_name, 'Key': key},
                    ExpiresIn=expires_in
                )
                return url
            except ClientError as e:
                logger.error(f"S3 presigned URL error: {e}")
                raise
        else:
            # Public URL
            return f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{key}"

    def list_files(self, prefix: str = "", max_keys: int = 100) -> list:
        """List files in bucket"""
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=max_keys
            )

            files = []
            for obj in response.get('Contents', []):
                files.append({
                    "key": obj['Key'],
                    "size": obj['Size'],
                    "modified": obj['LastModified'],
                    "url": self.get_url(obj['Key'])
                })

            return files

        except ClientError as e:
            logger.error(f"S3 list error: {e}")
            return []


class CloudinaryStorage(StorageBackend):
    """Cloudinary storage backend"""

    def __init__(self):
        if not CLOUDINARY_AVAILABLE:
            raise RuntimeError("cloudinary not installed")

        cloudinary_url = os.environ.get("CLOUDINARY_URL")
        if not cloudinary_url:
            # Try individual credentials
            cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME")
            api_key = os.environ.get("CLOUDINARY_API_KEY")
            api_secret = os.environ.get("CLOUDINARY_API_SECRET")

            if not all([cloud_name, api_key, api_secret]):
                raise RuntimeError("Cloudinary credentials not configured")

            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret
            )
        else:
            # Use CLOUDINARY_URL
            cloudinary.config()

        logger.info("Cloudinary storage initialized")

    def upload(
        self,
        file: BinaryIO,
        filename: str,
        folder: str = "",
        resource_type: str = "auto",
        **kwargs
    ) -> Dict:
        """
        Upload file to Cloudinary

        Args:
            file: File object
            filename: Original filename
            folder: Optional folder path
            resource_type: 'image', 'video', 'raw', or 'auto'
            **kwargs: Additional Cloudinary options

        Returns:
            Dict with 'url', 'public_id', 'resource_type'
        """
        try:
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                file,
                folder=folder,
                resource_type=resource_type,
                use_filename=True,
                unique_filename=True,
                **kwargs
            )

            logger.info(f"Uploaded to Cloudinary: {result['public_id']}")

            return {
                "url": result['secure_url'],
                "public_id": result['public_id'],
                "resource_type": result['resource_type'],
                "format": result.get('format'),
                "width": result.get('width'),
                "height": result.get('height'),
                "backend": "cloudinary"
            }

        except Exception as e:
            logger.error(f"Cloudinary upload error: {e}")
            raise

    def delete(self, public_id: str, resource_type: str = "image") -> bool:
        """Delete file from Cloudinary"""
        try:
            result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
            logger.info(f"Deleted from Cloudinary: {public_id}")
            return result.get('result') == 'ok'
        except Exception as e:
            logger.error(f"Cloudinary delete error: {e}")
            return False

    def get_url(
        self,
        public_id: str,
        transformation: Optional[Dict] = None,
        expires_in: Optional[int] = None
    ) -> str:
        """
        Get URL for file with optional transformations

        Args:
            public_id: Cloudinary public ID
            transformation: Optional transformation params (e.g., width, height, crop)
            expires_in: Expiration time in seconds (for signed URLs)

        Returns:
            Cloudinary URL
        """
        options = {}

        if transformation:
            options['transformation'] = transformation

        if expires_in:
            options['sign_url'] = True
            options['type'] = 'authenticated'

        url, _ = cloudinary.utils.cloudinary_url(public_id, **options)
        return url

    def list_files(self, prefix: str = "", max_results: int = 100) -> list:
        """List files in Cloudinary"""
        try:
            result = cloudinary.api.resources(
                type='upload',
                prefix=prefix,
                max_results=max_results
            )

            files = []
            for resource in result.get('resources', []):
                files.append({
                    "public_id": resource['public_id'],
                    "url": resource['secure_url'],
                    "format": resource['format'],
                    "size": resource['bytes'],
                    "created": resource['created_at']
                })

            return files

        except Exception as e:
            logger.error(f"Cloudinary list error: {e}")
            return []


class Storage:
    """
    Unified storage interface

    Automatically uses the configured backend (S3 or Cloudinary)
    """

    def __init__(self, backend: Optional[str] = None):
        """
        Initialize storage

        Args:
            backend: 's3' or 'cloudinary' (auto-detected if None)
        """
        self.backend_type = backend or os.environ.get("STORAGE_BACKEND", "s3")
        self.backend = None

        if self.backend_type == "s3":
            if S3_AVAILABLE and os.environ.get("AWS_S3_BUCKET"):
                self.backend = S3Storage()
            else:
                logger.warning("S3 not available, falling back to Cloudinary")
                self.backend_type = "cloudinary"

        if self.backend_type == "cloudinary":
            if CLOUDINARY_AVAILABLE and (os.environ.get("CLOUDINARY_URL") or os.environ.get("CLOUDINARY_CLOUD_NAME")):
                self.backend = CloudinaryStorage()
            else:
                logger.warning("Cloudinary not available")

        if self.backend is None:
            logger.warning("No storage backend configured. Uploads will fail.")

    def upload(self, file: BinaryIO, filename: str, folder: str = "", **kwargs) -> Dict:
        """Upload file to configured backend"""
        if self.backend is None:
            raise RuntimeError("No storage backend configured")

        return self.backend.upload(file, filename, folder, **kwargs)

    def delete(self, file_id: str, **kwargs) -> bool:
        """Delete file from configured backend"""
        if self.backend is None:
            return False

        return self.backend.delete(file_id, **kwargs)

    def get_url(self, file_id: str, **kwargs) -> str:
        """Get URL for file"""
        if self.backend is None:
            raise RuntimeError("No storage backend configured")

        return self.backend.get_url(file_id, **kwargs)

    def is_configured(self) -> bool:
        """Check if storage backend is configured"""
        return self.backend is not None


# Global storage instance
_storage = None


def get_storage() -> Storage:
    """Get or create global storage instance"""
    global _storage
    if _storage is None:
        _storage = Storage()
    return _storage


# ===================
# Helper Functions
# ===================

def upload_file(file: BinaryIO, filename: str, folder: str = "") -> Dict:
    """
    Convenience function to upload file

    Args:
        file: File object
        filename: Original filename
        folder: Optional folder path

    Returns:
        Upload result dict
    """
    storage = get_storage()
    return storage.upload(file, filename, folder)


def delete_file(file_id: str) -> bool:
    """Delete file from storage"""
    storage = get_storage()
    return storage.delete(file_id)


def get_file_url(file_id: str, expires_in: Optional[int] = None) -> str:
    """Get URL for file"""
    storage = get_storage()
    return storage.get_url(file_id, expires_in=expires_in)
