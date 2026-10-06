import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { CONTRACT_ABI } from '@/app/constants/contractABI';

export async function POST(req: Request) {
  try {
    // Проверка авторизации
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Получение данных из запроса
    const data = await req.json();
    const {
      name,
      description,
      startTime,
      endTime,
      options,
      isPublic,
      allowedEmails
    } = data;

    // Валидация данных
    if (!name || !description || !startTime || !endTime || !options) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (options.length < 2) {
      return NextResponse.json(
        { message: 'Minimum 2 options required' },
        { status: 400 }
      );
    }

    // Проверка валидности времени
    const startTimeUnix = startTime;  // Уже в Unix timestamp из формы
    const endTimeUnix = endTime;      // Уже в Unix timestamp из формы
    const now = Math.floor(Date.now() / 1000);

    if (startTimeUnix <= now) {
      return NextResponse.json(
        { message: 'Start time must be in the future' },
        { status: 400 }
      );
    }

    if (endTimeUnix <= startTimeUnix) {
      return NextResponse.json(
        { message: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Проверка и обработка email для приватного голосования
    let allowedVoters: string[] = [];
    if (!isPublic) {
      if (!allowedEmails || allowedEmails.length === 0) {
        return NextResponse.json(
          { message: 'Private voting requires allowed emails' },
          { status: 400 }
        );
      }
      allowedVoters = allowedEmails; // <-- Передаём email-ы напрямую
    }

    // Подключение к контракту
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PRIVATE_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL
    );
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('Server wallet private key not configured');
    }
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
      CONTRACT_ABI,
      wallet
    );

    console.log('Creating voting with params:', {
      name,
      description,
      startTime: startTimeUnix,
      endTime: endTimeUnix,
      options,
      isPublic,
      allowedVoters
    });

    // Создание голосования с обработанными данными
    console.log('Sending transaction to contract...');
    const tx = await contract.createVoting(
      name,
      description,
      startTimeUnix,
      endTimeUnix,
      options,
      isPublic,
      allowedVoters
    );

    console.log('Transaction sent:', tx.hash);
    console.log('Waiting for transaction confirmation...');

    // Ожидание подтверждения транзакции с повторными попытками
    let receipt = null;
    let retries = 5;

    while (retries > 0 && !receipt) {
      try {
        receipt = await tx.wait(1); // Wait for 1 confirmation
        console.log('Transaction confirmed:', receipt);
        break;
      } catch (error) {
        console.log(`Failed to get receipt, retries left: ${retries}`, error);
        retries--;
        if (retries === 0) throw error;
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!receipt) {
      throw new Error('Failed to get transaction receipt after multiple attempts');
    }

    console.log('Looking for VotingCreated event...');
    // Получение ID созданного голосования из события
    const event = receipt.events?.find(
      (e: any) => e.event === 'VotingCreated'
    );

    if (!event) {
      console.log('Event not found in receipt, trying to get logs directly...');
      // Если событие не найдено, попробуем получить логи напрямую
      const logs = await provider.getLogs({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        topics: [ethers.id("VotingCreated(uint256)")],
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber
      });

      console.log('Retrieved logs:', logs);

      if (logs.length === 0) {
        throw new Error('Voting creation event not found');
      }

      // Декодируем событие из логов
      const iface = new ethers.Interface(CONTRACT_ABI);
      const decodedLog = iface.parseLog({
        topics: logs[0].topics,
        data: logs[0].data
      });

      console.log('Decoded log:', decodedLog);

      if (!decodedLog) {
        throw new Error('Failed to decode voting creation event');
      }

      return NextResponse.json({
        message: 'Voting created successfully',
        votingId: decodedLog.args[0].toString()
      });
    }

    console.log('Found event:', event);
    const votingId = event.args[0];

    return NextResponse.json({
      message: 'Voting created successfully',
      votingId: votingId.toString()
    });
  } catch (error) {
    console.error('Error creating voting:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create voting' },
      { status: 500 }
    );
  }
}
