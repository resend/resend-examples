import asyncio
import time
import resend

async def send_email(n):
    params: resend.Emails.SendParams = {
        "from": "onboarding@resend.dev",
        "to": ["delivered@resend.dev"],
        "subject": "hi",
        "html": "<strong>hello, world!</strong>",
    }

    email: resend.Email = resend.Emails.send(params)
    print("Email ID: #{} processed - #{}".format(email["id"], n))

async def send_in_parallel():
    tasks = [send_email(i) for i in range(1, 5)]

    start_time = time.time()
    for c in asyncio.as_completed(tasks):
        result = await c
        end_time = time.time()
        print(end_time - start_time, result)

    print(f"Total time {time.time() - start_time}")


if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    task = send_in_parallel()
    loop.run_until_complete(task)