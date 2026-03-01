import { useToastStore } from "../../stores/toast.store";
import { Toast } from "../atoms/toast";

export function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <box
      position="absolute"
      bottom={2}
      right={2}
      flexDirection="column-reverse"
      maxWidth={"80%"}
      gap={1}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} />
      ))}
    </box>
  );
}
