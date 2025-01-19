import base64
import re
from gmail_auth import get_gmail_service

def fetch_emails(service):
    results = service.users().messages().list(userId='me', labelIds=['INBOX'], maxResults=10).execute()
    messages = results.get('messages', [])
    return messages

def get_email_content(service, msg_id):
    msg = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
    payload = msg['payload']
    headers = payload['headers']
    subject = next(header['value'] for header in headers if header['name'] == 'Subject')
    body = ""

    if 'parts' in payload:
        for part in payload['parts']:
            if part['mimeType'] == 'text/plain':
                body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                break
    else:
        body = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8')

    return subject, body

def analyze_email(subject, body):
    phishing_keywords = ["verify", "password", "urgent", "login", "account"]
    suspicious_links = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', body)

    is_phishing = any(keyword in subject.lower() or keyword in body.lower() for keyword in phishing_keywords)
    return is_phishing, suspicious_links

def scan_emails():
    service = get_gmail_service()
    messages = fetch_emails(service)

    for message in messages:
        msg_id = message['id']
        subject, body = get_email_content(service, msg_id)
        is_phishing, suspicious_links = analyze_email(subject, body)

        if is_phishing:
            print(f"Phishing email detected: {subject}")
            print(f"Suspicious links: {suspicious_links}")
        else:
            print(f"Safe email: {subject}")

if __name__ == "__main__":
    scan_emails()