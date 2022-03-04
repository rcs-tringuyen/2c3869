import Chat from '../../components/Sidebar/Chat';
import React from 'react';
import ReactDOM, { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom/extend-expect';


let container = null;

beforeEach(() => {
  // set up a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

const conversation = {
    "id": 1,
    "readStatus": {
        "isRead": false,
        "latestMessageId": 179,
        "unreadMessagesCount": 23
    },
    "otherUser": {
        "photoUrl": "https://res.cloudinary.com/dmlvthmqr/image/upload/v1607914466/messenger/775db5e79c5294846949f1f55059b53317f51e30_s3back.png",
        "username": "Thomas",
        "online": true,
    },
    "latestMessageText": "latest message from Thomas!"
}

it("Show correct number of unread messages", () => {
    act(() => {
        ReactDOM.render(<Chat conversation={conversation} />, container);
    });
    expect(container.firstChild.childNodes[2].textContent).toBe("23");
})
