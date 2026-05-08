FROM python:3.11-slim AS runner
WORKDIR /app
RUN addgroup --system sfs && adduser --system --group sfsapp
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY --chown=sfsapp:sfs . .
USER sfsapp
ENV PORT=5000
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1
CMD ["python", "main.py"]
