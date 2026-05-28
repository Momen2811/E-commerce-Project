export default {
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    { name: 'product', title: 'Product', type: 'reference', to: [{ type: 'product' }] },
    { name: 'author', title: 'Author', type: 'string' },
    { name: 'rating', title: 'Rating', type: 'number', validation: (Rule) => Rule.min(1).max(5) },
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'body', title: 'Body', type: 'text' },
    { name: 'date', title: 'Date', type: 'datetime' },
  ],
}
