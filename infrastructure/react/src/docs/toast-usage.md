# Toast Store Documentation

## Usage

### Basic Usage

```typescript
import { useToast } from "../hooks/use-toast";

function MyComponent() {
	const toast = useToast();

	const handleClick = () => {
		// Show different types of toasts
		toast.info("Information message");
		toast.success("Success message");
		toast.warning("Warning message");
		toast.error("Error message");
	};

	return <button onClick={handleClick}>Show Toast</button>;
}
```

### Custom Duration

```typescript
// Show toast for 5 seconds (default is 3 seconds)
toast.success("This will show for 5 seconds", 5000);
```

### Clear All Toasts

```typescript
// Clear all active toasts
toast.clear();
```

## Features

- ✅ **Multiple toasts**: Display multiple toasts simultaneously
- ✅ **Auto-dismiss**: Toasts automatically disappear after duration
- ✅ **Stacking**: Toasts stack from bottom to top
- ✅ **Types**: info, success, warning, error
- ✅ **Custom duration**: Override default 3s duration
- ✅ **Unique IDs**: Each toast has a unique ID for proper removal

## Store Structure

The toast store (`stores/toast.store.ts`) contains:

- `toasts`: Array of active toast objects
- `addToast()`: Add new toast with auto-removal
- `removeToast()`: Remove specific toast by ID
- `clearAll()`: Clear all toasts

## Integration

The toast system is integrated into:

- `ToastContainer` component renders all active toasts
- `Layout` component includes the container
- `App` component demonstrates usage with loading states
