import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QtyStepper from './QtyStepper.jsx'

describe('QtyStepper', () => {
  it('renders the value', () => {
    render(<QtyStepper value={3} onChange={() => {}} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })
  it('increments on +', async () => {
    const onChange = vi.fn()
    render(<QtyStepper value={2} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('Increase'))
    expect(onChange).toHaveBeenCalledWith(3)
  })
  it('decrements on - but not below min (1)', async () => {
    const onChange = vi.fn()
    render(<QtyStepper value={1} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('Decrease'))
    expect(onChange).toHaveBeenCalledWith(1)
  })
})
