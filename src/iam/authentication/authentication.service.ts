import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { HashingService } from '../hashing/hashing.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class AuthenticationService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly hashingService:HashingService,
        private readonly jwtService:JwtService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>

    ){}

    async signUp(signUpDto:SignUpDto){
        try {
            const user = new User()
            user.email = signUpDto.email
            user.password =await this.hashingService.hash(signUpDto.password)
            await this.userRepository.save(user)
        } catch (err) {
            const pgUniqueViolationErrorCode = '23505';
            if (err.code === pgUniqueViolationErrorCode) {
                throw new ConflictException()
            }
            throw err;
        }
    }

    async signIn(signInDto:SignInDto){
        const user = await this.userRepository.findOneBy({email:signInDto.email})
        if(!user){
            throw new UnauthorizedException("user does not exists")
        }
        const isEqual = await this.hashingService.compare(
            signInDto.password,
            user.password
        )
        if(!isEqual){
            throw new UnauthorizedException('Password does not match')
        }
        const accessToken = await this.jwtService.signAsync({
            sub:user.id,
            email:user.email
        } as ActiveUserData,{
            audience:this.jwtConfiguration.audience,
            issuer:this.jwtConfiguration.issuer,
            secret:this.jwtConfiguration.secret,
            expiresIn:this.jwtConfiguration.accessTokenTtl
        })
        return {accessToken}
    }
}
