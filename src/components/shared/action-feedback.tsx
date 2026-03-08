export type ActionMessage = {
  type: "success" | "error";
  text: string;
};

export function ActionFeedback({ message }: { message: ActionMessage | null }) {
  if (!message) return null;

  return (
    <p
      className={
        message.type === "success"
          ? "text-sm text-green-600 dark:text-green-400"
          : "text-sm text-destructive"
      }
    >
      {message.text}
    </p>
  );
}
