import UserNotification, {
  UserNotificationType,
} from "../models/UserNotification";

export async function createUserNotification(
  userId: string,
  type: UserNotificationType,
  title: string,
  body: string,
): Promise<void> {
  try {
    await UserNotification.create({ userId, type, title, body });
  } catch (err) {
    console.error("createUserNotification:", err);
  }
}
