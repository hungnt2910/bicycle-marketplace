import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class UsersService {}
