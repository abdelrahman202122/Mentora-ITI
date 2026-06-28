interface EmptyStateProps {
  message: string;
  colSpan?: number;
}

export function EmptyState({ message, colSpan = 6 }: EmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-gray-500">
        {message}
      </td>
    </tr>
  );
}
