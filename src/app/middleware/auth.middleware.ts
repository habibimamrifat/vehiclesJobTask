import type { Request, Response, NextFunction } from "express";
import { JwtService } from "../helpers/jwt.service.js";
import db from "../database/knex.js";
import { checkRateLimit } from "../helpers/ret-limit.js";

const jwtService = new JwtService();

export const authenticate = () => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const authHeader = req.headers.authorization;
    // console.log(`Authorization Header: ${authHeader}`);

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = jwtService.verify(token!);

      const staff = await db("staff").where({ id: payload.id }).first();

      if (!staff) {
        res.status(401).json({
          message: "Staff account not found",
        });
        return;
      }

      req.user = {
        id: staff.id,
      };

      //add rate limit check here

      try {
        const allowed = await checkRateLimit(`staff:${staff.id}`);

        if (!allowed) {
          res.status(429).json({
            message: "Too many requests. Please try again later.",
          });
          return;
        }
      } catch (error) {
        console.error("Rate limit check failed:", error);
      }

      next();
    } catch {
      res.status(401).json({
        message: "Invalid or expired token",
      });
    }
  };
};
