export type Message = {

    id: string;
    role: 'user' | 'agent';
    content: string;
    citations?: string[];

}