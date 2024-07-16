import { Permission } from "../../interfaces/database";
import connectCollection from "../database/mongo";

export default async function listPermissions(): Promise<Permission[]> {
  const coll = await connectCollection("permissions");

  const result = coll.find({ active: true });

  return await result.toArray();
}
