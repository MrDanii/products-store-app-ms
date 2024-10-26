import { User } from "@prisma/client";
import { CreateUserDto } from "../../auth/dto";
import { OrderDetailsDto } from "../../orders/dto";

export const SEED_USERS: CreateUserDto[] = [
  {
    email: "dan333123@gmail.com",
    fullName: "Daniel Davs",
    password: "123456",
    userNickName: "danUser"
  },
  {
    email: "danilance@gmail.com",
    fullName: "Daniel Lancer",
    password: "123456",
    userNickName: "danLancer"
  },
  {
    email: "pao@gmail.com",
    fullName: "Paola Vazques",
    password: "123456",
    userNickName: "paoUser"
  },
]
