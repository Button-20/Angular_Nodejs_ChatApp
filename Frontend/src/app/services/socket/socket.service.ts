import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Message } from '../models/message';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket = io(environment.socket.url);
  users: User[] = [];
  messages: Message[] = [];
  currentUser: User | undefined;
  receiverDetails: User | undefined;

  constructor(private auth: AuthService) {}

  setOnline() {
    this.auth.getUser().subscribe((user: any) => {
      this.socket.emit('join', {
        username: user?.name,
        email: user?.email,
        status: 'online',
        picture: user?.picture,
      });
      this.socket.on('users', (data) => {
        this.currentUser = data.find(
          (userData: User) => userData.email === user?.email
        );
        this.users = data.filter(
          (userData: User) =>
            userData.status === 'online' &&
            userData.email !== user?.email &&
            !userData.blacklisted.includes(this.currentUser?._id as string)
        );
      });
    });
  }

  setOffline() {
    this.auth.getUser().subscribe((user) => {
      this.socket.emit('leave', {
        username: user?.name,
        email: user?.email,
        status: 'offline',
        picture: user?.picture,
      });
    });
  }

  sendMessage(message: Message) {
    this.socket.emit('message', message);
    // get socket id of receiver
    this.socket.on('message-received', (data: Message) => {
      this.getMessages({
        sender: data.sender,
        receiver: data.receiver,
      });
    });
  }

  getMessages(data: any) {
    this.socket.emit('getMessages', data);
    this.socket.on('messages', (data: Message[]) => {
      this.messages = data;
    });
  }

  blockUser(data: any) {
    this.socket.emit('blockUser', data);
    this.socket.on('users', (data) => {
      this.currentUser = data.find(
        (userData: User) => userData.email === this.currentUser?.email
      );
      this.users = data.filter(
        (userData: User) =>
          userData.status === 'online' &&
          userData.email !== this.currentUser?.email &&
          !userData.blacklisted.includes(this.currentUser?._id as string)
      );
      this.receiverDetails = undefined;
    });
  }
}
