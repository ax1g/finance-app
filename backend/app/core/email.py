import logging

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, body: str) -> None:
    logger.info(
        "--- EMAIL ---\nTo: %s\nSubject: %s\n\n%s\n--- END EMAIL ---",
        to,
        subject,
        body,
    )
