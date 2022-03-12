from django.test import TransactionTestCase
from rest_framework import status
from rest_framework.test import APITransactionTestCase
from messenger_backend.models import User, Conversation, Message
from pprint import pprint

class MessageTestCase(APITransactionTestCase):
    reset_sequences = True

    def setUp(self):
        """
        santiago: Where are you from?
        thomas: I'm from New York
        santiago: Send pics pls 
        """

        thomas = User(
        username="thomas",
        email="thomas@email.com",
        password="123456",
        photoUrl="https://res.cloudinary.com/dmlvthmqr/image/upload/v1607914467/messenger/thomas_kwzerk.png",
        )

        thomas.save()

        self.thomas_token = self.client.post(
            "/auth/login", 
            data={
                "username":"thomas",
                "password":"123456"
            }, 
            format="json"
        ).json().get("token")

        santiago = User(
            username="santiago",
            email="santiago@email.com",
            password="123456",
            photoUrl="https://res.cloudinary.com/dmlvthmqr/image/upload/v1607914466/messenger/775db5e79c5294846949f1f55059b53317f51e30_s3back.png",
        )

        santiago.save()

        self.santiago_token = self.client.post(
            "/auth/login", 
            data={
                "username":"santiago",
                "password":"123456"
            }, 
            format="json"
        ).json().get("token")

        santiagoConvo = Conversation(user1=thomas, user2=santiago)
        santiagoConvo.save()

        messages = Message(
            conversation=santiagoConvo, senderId=santiago.id, text="Where are you from?"
        )
        messages.save()

        messages = Message(
            conversation=santiagoConvo, senderId=thomas.id, text="I'm from New York"
        )
        messages.save()

        messages = Message(
            conversation=santiagoConvo,
            senderId=santiago.id,
            text="Share photo of your city, please",
        )
        messages.save()

    def test_conversations_read_status(self):
        conversations_response = self.client.get(
            "/api/conversations",
            format="json",
            **{
                "HTTP_X-ACCESS-TOKEN": self.thomas_token
            }
        )
        self.assertEqual(conversations_response.status_code, status.HTTP_200_OK)
        data = conversations_response.json()[0]
        self.assertIn("readStatus", data)
        read_status = data.get("readStatus")
        self.assertFalse(read_status["isRead"])
        self.assertIn("latestMessageId", read_status)
        self.assertIn("unreadMessagesCount", read_status)

    def test_message_read_by_recipient(self):
        # Thomas read Santiago's messages
        message_response = self.client.put(
            "/api/messages",
            data={
                "isRead": True,
                "conversationId": 1,
                "messageId": 3
            },
            format="json",
            **{
                "HTTP_X-ACCESS-TOKEN": self.thomas_token
            }
        )
        self.assertEqual(message_response.status_code, status.HTTP_204_NO_CONTENT)
        
        conversation_response = self.client.get(
            "/api/conversations",
            format="json",
            **{
                "HTTP_X-ACCESS-TOKEN": self.thomas_token
            }
        )

        conversation_data = conversation_response.json()[0]
        self.assertTrue(conversation_data['readStatus']['isRead'])
        

    def test_new_message_unread(self):
        # Thomas reply to Santiago
        message_response = self.client.post(
            "/api/messages",
            data={
                "conversationId": 1,
                "text": "Here it is!",
                "sender": 1,
                "recipientId": 2,
            },
            format="json",
            **{
                "HTTP_X-ACCESS-TOKEN": self.thomas_token
            }
        )
        self.assertEqual(message_response.status_code, status.HTTP_200_OK)
        data = message_response.json().get("message")
        self.assertFalse(data.get("isRead"))