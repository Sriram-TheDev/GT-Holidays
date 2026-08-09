import React, { useId, useState } from "react"
import { Mail, Lock, User, Phone, MapPin } from "lucide-react"

export default function FloatingInput({
  label = "Email",
  type = "email",
  icon = "mail",
  id,
  value,
  onChange,
  required = false,
  className = "",
  autoComplete
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const [focused, setFocused] = useState(false)

  const isFloating = focused || (value && value.length > 0)

  // Map icon string to lucide component
  let IconComponent = null
  switch (icon) {
    case 'mail': IconComponent = <Mail size={18} />; break;
    case 'lock': IconComponent = <Lock size={18} />; break;
    case 'user': IconComponent = <User size={18} />; break;
    case 'phone': IconComponent = <Phone size={18} />; break;
    case 'map-pin': IconComponent = <MapPin size={18} />; break;
    default: IconComponent = null; break;
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Icon */}
      {IconComponent && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors pointer-events-none z-10">
          {IconComponent}
        </span>
      )}

      {/* Input */}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white shadow-sm transition-all outline-none focus:border-[#00FFA3] focus:bg-white/10"
        style={{
          paddingLeft: IconComponent ? '3rem' : '1rem',
          paddingTop: '1rem',
        }}
      />

      {/* Floating Label */}
      <label
        htmlFor={inputId}
        className="absolute transition-all pointer-events-none z-10"
        style={{
          left: IconComponent ? '3rem' : '1rem',
          top: isFloating ? '0.35rem' : '50%',
          transform: isFloating ? 'translateY(0)' : 'translateY(-50%)',
          fontSize: isFloating ? '0.7rem' : '0.9rem',
          color: isFloating ? '#00FFA3' : 'rgba(255, 255, 255, 0.4)',
          fontWeight: isFloating ? 600 : 400
        }}
      >
        {label}
      </label>

      {/* Decorative glow */}
      <div
        className="absolute inset-x-4 -bottom-px h-[2px] bg-gradient-to-r from-transparent via-[#00FFA3]/80 to-transparent transition-opacity duration-300"
        style={{ opacity: focused ? 1 : 0 }}
      />
    </div>
  )
}
