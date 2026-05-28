import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { WishlistProvider } from '../context/WishlistContext.jsx'
import ProductCard from './ProductCard.jsx'

const base = {
  id: 'p-1', name: 'Boxy Tee', slug: 'boxy-tee', price: 48, compareAtPrice: null,
  images: ['/x.jpg'], isNew: false, inStock: true, colors: [], sizes: [],
}

const renderCard = (product) =>
  render(
    <WishlistProvider>
      <MemoryRouter><ProductCard product={product} /></MemoryRouter>
    </WishlistProvider>,
  )

describe('ProductCard', () => {
  it('shows the name and price', () => {
    renderCard(base)
    expect(screen.getByText('Boxy Tee')).toBeInTheDocument()
    expect(screen.getByText('$48.00')).toBeInTheDocument()
  })
  it('links to the product detail page', () => {
    renderCard(base)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/boxy-tee')
  })
  it('shows a sale badge and the old price when on sale', () => {
    renderCard({ ...base, price: 75, compareAtPrice: 100 })
    expect(screen.getByText('-25%')).toBeInTheDocument()
    expect(screen.getByText('$100.00')).toBeInTheDocument()
  })
  it('shows a sold-out badge when out of stock', () => {
    renderCard({ ...base, inStock: false })
    expect(screen.getByText('Sold out')).toBeInTheDocument()
  })
})
