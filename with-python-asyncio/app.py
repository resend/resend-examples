import asyncio
import time
import resend

def send_email(n):
    start_time = time.time()

    params: resend.Emails.SendParams = {
        "from": "onboarding@resend.dev",
        "to": ["delivered@resend.dev"],
        "subject": "hi",
        "html": "<strong>hello, world!</strong>",
    }

    email: resend.Email = resend.Emails.send(params)
    print("Email ID: #{} processed in #{}".format(email["id"], time.time() - start_time))

async def send_in_parallel():
    start_time = time.time()

    await asyncio.gather(
        asyncio.to_thread(send_email, 1),
        asyncio.to_thread(send_email, 2),
        asyncio.to_thread(send_email, 3),
        asyncio.to_thread(send_email, 4))

    print(f"Total time {time.time() - start_time}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    task = send_in_parallel()
    loop.run_until_complete(task)