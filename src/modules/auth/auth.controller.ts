import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Res,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @ApiOperation({ summary: "User login" })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  getProfile(
    @Request() req: { user: { id: string; email: string; name: string } },
  ) {
    return req.user;
  }

  @Get("info")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user permissions and menus" })
  getAuthInfo(
    @Request() req: { user: { id: string } },
  ) {
    return this.authService.getAuthInfo(req.user.id);
  }

  @Post("logout")
  @ApiOperation({ summary: "User logout" })
  async logout(@Res() res: any) {
    res.clearCookie('accessToken');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  }

  @Get("google")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Google Login" })
  async googleAuth(@Request() req: any) {
    // 触发 Google OAuth 流程
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Google Login Callback" })
  async googleAuthRedirect(@Request() req: any, @Res() res: any) {
    const result = await this.authService.googleLogin(req.user);
    
    // 将 accessToken 设置在 httpOnly cookie 中，更安全且不占用 URL 参数
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24小时
    });

    // 其他非敏感信息可以通过非 httpOnly cookie 传递，或者让前端后续通过接口获取
    // 这里为了方便前端展示，设置一个简单的标志和用户名
    res.cookie('username', result.username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const frontendUrl = 'http://localhost:5173/login?oauth=success';
    res.redirect(frontendUrl);
  }
}
