import { ConflictException, Injectable } from '@nestjs/common';
import { HashingService } from '../hashing/hashing.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';

@Injectable()
export class AuthenticationService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly hashingService:HashingService
    ){}

    async signUp(signUpDto:SignUpDto){
        try {
            const user = new User()
            user.email = signUpDto.email
            user.password =await this.hashingService.hash(signUpDto.password)
             this.userRepository.save(user)
        } catch (err) {
            const pgUniqueViolationErrorCode = '23505';
            if (err.code === pgUniqueViolationErrorCode) {
                throw new ConflictException()
            }
            throw err;
        }
    }

    async signIn(signInDto:SignInDto){
        return "ok"
    }
}
