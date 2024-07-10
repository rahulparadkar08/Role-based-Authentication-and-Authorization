import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';

@Controller('authentication')
export class AuthenticationController {
    constructor(
        private readonly authenticationService:AuthenticationService
    ){}

    @Post('sign-up')
    signUp(@Body() SignUpDto:SignUpDto){
        return this.authenticationService.signUp(SignUpDto)
    }

    @Post('sign-in')
    signIn(@Body() signInDto:SignInDto){
        return this.authenticationService.signIn(signInDto)
    }
}
