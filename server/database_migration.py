import json
f_conversations = open("conversation.json")
conversations = json.load(f_conversations)
f_messages = open("message.json")
messages = json.load(f_messages)

conversation_groups = []
message_groups = []

for convo in conversations:
    convo["model"] = "messenger_backend.conversationgroup"
    convo["fields"]["users"] = [convo["fields"]["user1"], convo["fields"]["user2"]]
    for message in messages:
        if message["fields"]["conversation"] == convo["pk"]:
            message["model"] = "messenger_backend.messagegroup"
            if not message["fields"]["isRead"]:
                message["fields"]["isRead"] = []
            else:
                if message["fields"]["senderId"] == convo["fields"]["user1"]:
                    message["fields"]["isRead"] = [convo["fields"]["user2"]]
                else:
                    message["fields"]["isRead"] = [convo["fields"]["user1"]]
            message_groups.append(message)
            del message

    del convo["fields"]["user1"]
    del convo["fields"]["user2"]
    conversation_groups.append(convo)

new_json_strings = json.dumps(conversation_groups)
json_conversation_group = open("conversation_group.json", "w")
json_conversation_group.write(new_json_strings)
f_conversations.close()
json_conversation_group.close()

new_json_strings = json.dumps(message_groups)
json_message_group = open("message_group.json", "w")
json_message_group.write(new_json_strings)
f_messages.close()
json_message_group.close()