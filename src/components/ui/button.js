export function Button({ children, variant = 'default', size = 'default', className = '', onClick, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
  
  let variantStyles = ''
  if (variant === 'default') {
    variantStyles = 'bg-blue-600 text-white hover:bg-blue-700'
  } else if (variant === 'outline') {
    variantStyles = 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  } else if (variant === 'ghost') {
    variantStyles = 'text-gray-600 hover:bg-gray-100'
  }
  
  let sizeStyles = ''
  if (size === 'default') {
    sizeStyles = 'h-10 px-4 py-2 text-sm'
  } else if (size === 'sm') {
    sizeStyles = 'h-8 px-3 text-xs'
  } else if (size === 'lg') {
    sizeStyles = 'h-12 px-8 text-lg'
  }
  
  const allClasses = `${baseStyles} ${variantStyles} ${sizeStyles} ${className}`
  
  return (
    <button
      className={allClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}