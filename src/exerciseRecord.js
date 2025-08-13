import { PrismaClient } from '@prisma/client';
import express from 'express';

const prisma = new PrismaClient();

const app = express();
const port = 3000;
app.use(express.json());

app.post('/group/:id/records', async(req, res) => {
    const groupId = Number(req.params.id);
    const { exerciseType, description, time, distance, photos, participantNickname, participantPassword } = req.body;
    
    if (isNaN(id)) {
    return res.status(400).json({ path: "groupId", message: "groupId must be integer" });
    }

    try {
        const participant = await prisma.participant.findUnique({
            where: {
                AND: [
                { nickname: participantNickname },
                { password: participantPassword }
                ],
            },
        });

        const record = await prisma.record.create({
            data:{
                groupId,
                exerciseType,
                description,
                time,
                distance,
                photos,
                participant: {
                    connect: { id: participant.id }
                }
            },
            include: {
                participant: true
            }
        });
       
        return res.status(200).json({
            id: record.id,
            exerciseType: record.exerciseType,
            description: record.description,
            time: record.time,
            distance: record.distance,
            photos: record.photos,
            participant: {
                id: record.participant.id,
                nickname: record.participant.nickname
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to create record" });
    }
});

app.get('/group/:id/records', async(req, res) => {
    const groupId = Number(req.params.id);
    const search = req.query.search || '';

    if (isNaN(id)) {
    return res.status(400).json({ path: "groupId", message: "groupId must be integer" });
    }
    try {
        const record = await prisma.record.findMany({
            where: {
                AND: [
                    {groupId: groupId,},
                    {
                        OR: [
                            {nickname: search,},
                            {nickname: null}
                        ],
                    },
                ],
            },
            select: {
                id: true,
                exerciseType: true,
                description: true,
                time: true,
                distance: true,
                photos: true,
                participant: {
                    connect: { id: participant.id }
                }
            },
            include: {
                participant: true
            },
        });
        
        const count = record.length;

        res.status(201).json({
            data: [
                {
                    id: record.id,
                    exerciseType: record.exerciseType,
                    description: record,description,
                    time: record.time,
                    distance: record.distance,
                    photos: record.photos,
                    participant: {
                        id: record.participant.id,
                        nickname: record.participant.nickname
                    }
                }
            ],
            total: count
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to find record" });
    }
});

app.get('/:groupId/records/:recordId', async(req, res) => {
    const groupId = Number(req.params.groupId);
    const recordId = Number(req.params.recordId);

    if (isNaN(groupId) || isNaN(recordId)) {
        return res.status(400).json({ message: "groupId and recordId must be integers" });
    }

    try {
        const record = await prisma.record.findUnique({
            where: {
                id: recordId,
            },
            select: {
                groupId: true,
                exerciseType: true,
                description: true,
                time: true,
                distance: true,
                photos: true,
                participant: {
                    select: {
                        participantId: true,
                        participantNickname: true,
                    },
                },
            },
        });
        if (!record || record.groupId !== groupId) {
            return res.status(404).json({ message: "Record not found for given group" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch record", error: err });
    }
});