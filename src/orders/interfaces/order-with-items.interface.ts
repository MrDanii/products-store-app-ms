import { OrderStatus } from "@prisma/client";

export interface OrderWithItems {
  orderDetails: {
    name: string;
    quantity: number;
    price: number;
    productCatalogIdProduct: string;
  }[];
  idOrder: string;
  orderStatus: OrderStatus;
  totalAmount: number;
  totalItems: number;
  discountApplied: number;
  cuponUsed: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  userIdUser: string | null;
}