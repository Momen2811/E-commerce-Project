export default function Logo({ tone = 'light', className = '' }) {
  const src = tone === 'dark' ? '/logo-footer.png' : '/logo.png'
  return <img className={`logo ${className}`} src={src} alt="B2B" />
}
