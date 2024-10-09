import { Request, Response } from "express"
import prisma from "../db/prisma.js"

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { message } = req.body
        const { id: recieverId } = req.params
        const senderId = req.user.id

        let conversation = await prisma.conversation.findFirst({
            where: {
                participantIds: {
                    hasEvery: [senderId, recieverId]
                }
            }
        })
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    participantIds: {
                        set: [senderId, recieverId]
                    }
                }
            })
        }

        const newMessage = await prisma.message.create({
            data: {
                senderId,
                body: message,
                conversationId: conversation.id
            }
        })

        if (newMessage) {
            conversation = await prisma.conversation.update({
                where: {
                    id: conversation.id
                },
                data: {
                    messages: {
                        connect: {
                            id: newMessage.id
                        }
                    }
                }
            })
        }

        //socket io 

        res.status(201).json(newMessage)
    } catch (error: any) {
        console.error("Error in sendMessage : ", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
}

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { id: usertoChatId } = req.params
        const senderId = req.user.id

        const conversation = await prisma.conversation.findFirst({
            where: {
                participantIds: {
                    hasEvery: [senderId, usertoChatId]
                }
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc"
                    }
                }
            }
        })

        if (!conversation) {
            return res.status(200).json([])
        }

        res.status(201).json(conversation)

    } catch (error: any) {
        console.error("Error in getMessage : ", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
}

export const getUsersForSidebar = async (req: Request, res: Response) => {
    try {
        const authUserId = req.user.id

        const users = await prisma.user.findMany({
            where: {
                id:{
                    not:authUserId
                }
            },
            select:{
                id:true,
                fullName:true,
                profilePic:true,
            }
        })

        res.status(200).json(users)
    } catch (error: any) {
        console.error("Error in getUsersForSidebar : ", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
}