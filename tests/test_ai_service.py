"""
Tests for AI Service Module
"""

import pytest
from ai_service import AIContentGenerator, get_ai_generator


class TestAIContentGenerator:
    """Test AI content generation"""

    def test_init(self):
        """Test AI generator initialization"""
        generator = AIContentGenerator()
        assert generator is not None

    def test_is_available(self):
        """Test checking AI availability"""
        generator = AIContentGenerator()
        # Should return True if APIs configured, False otherwise
        result = generator.is_available()
        assert isinstance(result, bool)

    def test_generate_social_posts_with_mock(self):
        """Test social post generation (uses mock if no API)"""
        generator = AIContentGenerator()

        posts = generator.generate_social_posts(
            topic="Launching our new product",
            niche="Tech & SaaS",
            platform="LinkedIn",
            tone="Professional",
            num_variations=3
        )

        assert len(posts) == 3
        assert all(post.platform == "LinkedIn" for post in posts)
        assert all(len(post.caption) > 0 for post in posts)
        assert all(len(post.hashtags) > 0 for post in posts)

    def test_generate_social_posts_different_platforms(self):
        """Test post generation for different platforms"""
        generator = AIContentGenerator()

        platforms = ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok']

        for platform in platforms:
            posts = generator.generate_social_posts(
                topic="Test topic",
                niche="Tech & SaaS",
                platform=platform,
                tone="Casual",
                num_variations=2
            )

            assert len(posts) == 2
            assert all(post.platform == platform for post in posts)

    def test_generate_email_content(self):
        """Test email content generation"""
        generator = AIContentGenerator()

        email = generator.generate_email_content(
            subject="New Feature Launch",
            audience="Active Users",
            goal="Engagement",
            tone="Professional"
        )

        assert 'subject_line' in email
        assert 'preview_text' in email
        assert 'body_html' in email
        assert len(email['subject_line']) > 0
        assert len(email['body_html']) > 0

    def test_build_prompt(self):
        """Test prompt building"""
        generator = AIContentGenerator()

        prompt = generator._build_prompt(
            topic="Test topic",
            niche="Tech & SaaS",
            platform="Instagram",
            tone="Professional",
            num_variations=3
        )

        assert "Test topic" in prompt
        assert "Instagram" in prompt
        assert "Professional" in prompt
        assert "Tech & SaaS" in prompt


class TestGlobalAIGenerator:
    """Test global AI generator instance"""

    def test_get_ai_generator_singleton(self):
        """Test that get_ai_generator returns singleton"""
        gen1 = get_ai_generator()
        gen2 = get_ai_generator()

        assert gen1 is gen2


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
