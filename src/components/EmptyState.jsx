export default function EmptyState({ message = 'Nothing here yet.' }) {
  return <div className="empty"><p>{message}</p></div>
}
