export interface User {
    _id: string;
    socketId: string;
    username: string;
    email: string;
    status: string;
    picture: string;
    blacklisted: Array<string>;
    createdAt: Date;
}