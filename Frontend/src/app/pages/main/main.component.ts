import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@auth0/auth0-angular';
import { NgxSpinnerService } from 'ngx-spinner';
import { SocketService } from 'src/app/services/socket/socket.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  messageForm: FormGroup = new FormGroup({
    message: new FormControl('', Validators.required),
    sender: new FormControl('', Validators.required),
    receiver: new FormControl('', Validators.required),
  });

  constructor(
    public auth: AuthService,
    private spinner: NgxSpinnerService,
    public socketService: SocketService
  ) {}

  ngOnInit() {
    this.autoResizeTextArea();
    this.socketService.setOnline();
  }

  logoutWithAuth0() {
    this.spinner.show();
    this.auth.logout({ returnTo: window.location.origin });
  }

  autoResizeTextArea() {
    const textArea = document.getElementById(
      'autoresizing'
    ) as HTMLTextAreaElement;
    if (textArea) {
      textArea.addEventListener('input', function (this: HTMLTextAreaElement) {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
        if (this.scrollHeight > 108) {
          this.style.overflow = 'auto';
        } else {
          this.style.overflow = 'hidden';
        }
      } as EventListener);
    }
  }

  setReceiver(user: any) {
    this.socketService.getMessages({
      sender: this.socketService.currentUser?._id,
      receiver: user._id,
    });
    this.messageForm.patchValue({
      receiver: user._id,
      sender: this.socketService.currentUser?._id,
    });
    this.socketService.receiverDetails = user;
    this.scrollToBottom();
  }

  sendMessage() {
    if (
      this.messageForm.valid &&
      this.messageForm.value.message.trim() !== ''
    ) {
      this.socketService.sendMessage(this.messageForm.value);
      this.messageForm.patchValue({
        message: '',
      });
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const chat = document.getElementById('main-chat-body') as HTMLElement;
      if (chat) {
        chat.style.scrollBehavior = 'smooth';
        chat.scrollTop = chat.scrollHeight;
      }
    }, 500);
  }

  blockUser() {
    if (
      confirm(
        'Are you sure you want to block this user? \n NB: This action cannot be reversed again!!'
      ) == true
    ) {
      this.socketService.blockUser({
        sender: this.socketService.currentUser?._id,
        receiver: this.socketService.receiverDetails?._id,
      });
    }
  }

  submitWithEnter(event: any) {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
