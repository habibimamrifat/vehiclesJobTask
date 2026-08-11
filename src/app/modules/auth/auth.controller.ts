import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { checkRateLimit } from "../../helpers/ret-limit.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      const allowed = await checkRateLimit(`user:${req.ip}`);

      if (!allowed) {
        res.status(429).json({
          message: "Too many requests. Please try again later.",
        });
        return;
      }
    } catch (error) {
      console.error("Rate limit check failed:", error);
    }

    try {
      const result = await this.authService.login(email, password);

      res.status(200).json({
        message: "Login successful",
        ...result,
      });
    } catch (error) {
      res.status(401).json({
        message: error instanceof Error ? error.message : "Invalid credentials",
      });
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      message: "Logout successful",
    });
  }

  async me(req: Request, res: Response): Promise<void> {
    const staff = await this.authService.getStaff(req.user!.id);

    if (!staff) {
      res.status(404).json({
        message: "Staff account not found",
      });

      return;
    }

    res.status(200).json({
      user: staff,
    });
  }
}
