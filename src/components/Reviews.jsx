import { useEffect, useState } from 'react'
import { getReviews } from '../lib/cms.js'
import { averageRating, ratingDistribution } from '../lib/reviews.js'
import Stars from './Stars.jsx'

export default function Reviews({ productId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    getReviews(productId).then((r) => { if (active) { setReviews(r); setLoading(false) } })
    return () => { active = false }
  }, [productId])

  if (loading) return null
  const avg = averageRating(reviews)
  const dist = ratingDistribution(reviews)

  return (
    <section className="section" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <div className="section__head"><h2 className="section__title">Reviews</h2></div>
      {reviews.length === 0 ? (
        <p className="reviews__empty">No reviews yet.</p>
      ) : (
        <div className="reviews__body">
          <div className="reviews__summary">
            <div className="reviews__avg">{avg.toFixed(1)}</div>
            <Stars value={avg} size={20} />
            <p className="reviews__count">{reviews.length} review{reviews.length === 1 ? '' : 's'}</p>
            <div className="reviews__bars">
              {[5, 4, 3, 2, 1].map((star) => {
                const n = dist[star]
                const pct = reviews.length ? (n / reviews.length) * 100 : 0
                return (
                  <div className="reviews__bar" key={star}>
                    <span className="reviews__bar-label">{star}</span>
                    <span className="reviews__bar-track"><span className="reviews__bar-fill" style={{ width: `${pct}%` }} /></span>
                    <span className="reviews__bar-n">{n}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <ul className="reviews__list">
            {reviews.map((r) => (
              <li className="review" key={r.id}>
                <div className="review__head">
                  <Stars value={r.rating} size={14} />
                  <span className="review__author">{r.author}</span>
                  <span className="review__date">{new Date(r.date).toLocaleDateString()}</span>
                </div>
                <h4 className="review__title">{r.title}</h4>
                <p className="review__body">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
