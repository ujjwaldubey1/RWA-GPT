from uagents import Agent, Context, Model


class Message(Model):
    content: str


agent = Agent(name="RWA-GPT-Agent")


@agent.on_message(model=Message)
async def handle_message(ctx: Context, sender: str, msg: Message) -> None:
    ctx.logger.info(f"Received message from {sender}: {msg.content}")
    await ctx.send(sender, Message(content="Message received"))


def query_rwa_database(query: str) -> str:
    return (
        "[\n"
        "  {\"asset_id\": \"TCB-001\", \"asset_type\": \"Tokenized T-Bill\", \"protocol\": \"Ondo\", \"yield_apy\": 4.8},\n"
        "  {\"asset_id\": \"PCR-007\", \"asset_type\": \"Private Credit\", \"protocol\": \"Centrifuge\", \"yield_apy\": 9.2}\n"
        "]"
    )


if __name__ == "__main__":
    agent.run()


