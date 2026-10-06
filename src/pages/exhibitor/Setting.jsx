import { useEffect, useState } from 'react'
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  CalendarDays,
  MessageSquare,
  Lock,
  ChevronRight,
  Check,
  Moon,
  Sun,
  Smartphone,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { API_ORIGIN } from '../../config/api'

const STORAGE_KEY = 'eventsphere_exhibitor_settings'

const defaultSettings = {
  emailNotifications: true,
  eventReminders: true,
  applicationUpdates: true,
  messageNotifications: true,
  marketingEmails: false,
  darkMode: false,
  language: 'English',
}

const SettingsRow = ({
  icon: Icon,
  title,
  description,
  children,
}) => {
  return (
    <div className="flex items-center justify-between gap-5 py-5 border-b border-slate-100 last:border-b-0">
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-800">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        {children}
      </div>
    </div>
  )
}

const Toggle = ({ enabled, onChange }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`
        relative
        inline-flex
        h-6
        w-11
        shrink-0
        cursor-pointer
        rounded-full
        transition-colors
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-blue-200
        ${
          enabled
            ? 'bg-blue-600'
            : 'bg-slate-200'
        }
      `}
      aria-pressed={enabled}
    >
      <span
        className={`
          pointer-events-none
          inline-block
          h-5
          w-5
          translate-y-0.5
          rounded-full
          bg-white
          shadow-sm
          transition-transform
          duration-200
          ${
            enabled
              ? 'translate-x-5'
              : 'translate-x-0.5'
          }
        `}
      />
    </button>
  )
}

const ExhibitorSettings = () => {
  const { user } = useAuth()

  const [settings, setSettings] = useState(defaultSettings)
  const [saved, setSaved] = useState(false)

  // Load saved settings
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)

      if (stored) {
        const parsed = JSON.parse(stored)

        setSettings({
          ...defaultSettings,
          ...parsed,
        })
      }
    } catch (error) {
      console.error(
        'Failed to load exhibitor settings:',
        error
      )
    }
  }, [])

  const updateSetting = (key, value) => {
    setSettings((previous) => {
      const updated = {
        ...previous,
        [key]: value,
      }

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updated)
        )
      } catch (error) {
        console.error(
          'Failed to save settings:',
          error
        )
      }

      return updated
    })

    setSaved(true)

    window.clearTimeout(
      updateSetting.timeout
    )

    updateSetting.timeout = window.setTimeout(() => {
      setSaved(false)
    }, 1800)
  }

  const handleLanguageChange = (event) => {
    updateSetting(
      'language',
      event.target.value
    )
  }

  return (
    <div className="min-h-full bg-slate-50/60">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Shield className="w-4 h-4" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Exhibitor Portal
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Settings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your account preferences and
              notification settings.
            </p>
          </div>

          {saved && (
            <div className="
              inline-flex
              items-center
              gap-2
              self-start
              rounded-xl
              bg-emerald-50
              border
              border-emerald-100
              px-4
              py-2.5
              text-sm
              font-medium
              text-emerald-700
            ">
              <Check className="w-4 h-4" />
              Settings saved
            </div>
          )}

        </div>
      </div>

      {/* =====================================================
          ACCOUNT OVERVIEW
      ===================================================== */}

      <div className="
        relative
        overflow-hidden
        rounded-2xl
        bg-gradient-to-r
        from-slate-900
        via-blue-950
        to-blue-800
        p-6
        md:p-7
        mb-6
        shadow-sm
      ">

        {/* Decorative shapes */}
        <div className="
          absolute
          -right-16
          -top-20
          h-48
          w-48
          rounded-full
          bg-blue-500/10
        " />

        <div className="
          absolute
          -bottom-24
          right-24
          h-44
          w-44
          rounded-full
          bg-cyan-400/10
        " />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">

          {/* Avatar */}
          <div className="
            h-16
            w-16
            shrink-0
            overflow-hidden
            rounded-2xl
            border
            border-white/20
            bg-white/10
            flex
            items-center
            justify-center
            text-xl
            font-bold
            text-white
          ">
            {user?.avatar ? (
              <img
                src={
                  user.avatar.startsWith('http')
                    ? user.avatar
                    : `${API_ORIGIN}${user.avatar}`
                }
                alt={user?.name || 'Exhibitor'}
                className="h-full w-full object-cover"
              />
            ) : (
              (user?.name ||
                user?.email ||
                'E')
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-blue-200 mb-1">
              Account
            </p>

            <h2 className="text-xl font-bold text-white truncate">
              {user?.name || 'Exhibitor'}
            </h2>

            <p className="text-sm text-blue-100/80 truncate">
              {user?.email || 'Exhibitor account'}
            </p>
          </div>

          <div className="sm:ml-auto">
            <span className="
              inline-flex
              items-center
              rounded-full
              border
              border-white/15
              bg-white/10
              px-3
              py-1.5
              text-xs
              font-semibold
              text-white
            ">
              Exhibitor
            </span>
          </div>

        </div>
      </div>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ===================================================
            LEFT / MAIN SETTINGS
        =================================================== */}

        <div className="xl:col-span-2 space-y-6">

          {/* NOTIFICATIONS */}
          <section className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            overflow-hidden
          ">

            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="
                  w-10
                  h-10
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                  flex
                  items-center
                  justify-center
                ">
                  <Bell className="w-5 h-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Notifications
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    Choose what notifications you want to receive.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6">

              <SettingsRow
                icon={Mail}
                title="Email notifications"
                description="Receive important account updates by email."
              >
                <Toggle
                  enabled={settings.emailNotifications}
                  onChange={(value) =>
                    updateSetting(
                      'emailNotifications',
                      value
                    )
                  }
                />
              </SettingsRow>

              <SettingsRow
                icon={CalendarDays}
                title="Event reminders"
                description="Get reminders about upcoming expos and events."
              >
                <Toggle
                  enabled={settings.eventReminders}
                  onChange={(value) =>
                    updateSetting(
                      'eventReminders',
                      value
                    )
                  }
                />
              </SettingsRow>

              <SettingsRow
                icon={Check}
                title="Application updates"
                description="Know when your expo applications are approved or updated."
              >
                <Toggle
                  enabled={settings.applicationUpdates}
                  onChange={(value) =>
                    updateSetting(
                      'applicationUpdates',
                      value
                    )
                  }
                />
              </SettingsRow>

              <SettingsRow
                icon={MessageSquare}
                title="Message notifications"
                description="Receive notifications when someone sends you a message."
              >
                <Toggle
                  enabled={settings.messageNotifications}
                  onChange={(value) =>
                    updateSetting(
                      'messageNotifications',
                      value
                    )
                  }
                />
              </SettingsRow>

              <SettingsRow
                icon={Mail}
                title="Marketing emails"
                description="Receive EventSphere news, tips and promotional updates."
              >
                <Toggle
                  enabled={settings.marketingEmails}
                  onChange={(value) =>
                    updateSetting(
                      'marketingEmails',
                      value
                    )
                  }
                />
              </SettingsRow>

            </div>
          </section>

          {/* APPEARANCE */}
          <section className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            overflow-hidden
          ">

            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">

                <div className="
                  w-10
                  h-10
                  rounded-xl
                  bg-violet-50
                  text-violet-600
                  flex
                  items-center
                  justify-center
                ">
                  <Palette className="w-5 h-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Appearance
                  </h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize how your dashboard looks.
                  </p>
                </div>

              </div>
            </div>

            <div className="px-6">

              <SettingsRow
                icon={
                  settings.darkMode
                    ? Moon
                    : Sun
                }
                title="Dark mode"
                description="Use a darker appearance for your dashboard."
              >
                <Toggle
                  enabled={settings.darkMode}
                  onChange={(value) =>
                    updateSetting(
                      'darkMode',
                      value
                    )
                  }
                />
              </SettingsRow>

              <SettingsRow
                icon={Globe}
                title="Language"
                description="Select your preferred dashboard language."
              >
                <select
                  value={settings.language}
                  onChange={handleLanguageChange}
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3
                    py-2
                    text-sm
                    font-medium
                    text-slate-700
                    outline-none
                    focus:border-blue-400
                    focus:ring-4
                    focus:ring-blue-50
                  "
                >
                  <option value="English">
                    English
                  </option>

                  <option value="Urdu">
                    Urdu
                  </option>
                </select>
              </SettingsRow>

            </div>
          </section>

        </div>

        {/* ===================================================
            RIGHT SIDEBAR
        =================================================== */}

        <div className="space-y-6">

          {/* ACCOUNT */}
          <section className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            overflow-hidden
          ">

            <div className="p-6">

              <div className="
                w-11
                h-11
                rounded-xl
                bg-emerald-50
                text-emerald-600
                flex
                items-center
                justify-center
                mb-4
              ">
                <User className="w-5 h-5" />
              </div>

              <h2 className="font-bold text-slate-900">
                Account
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Manage your personal and company
                information.
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.href =
                    '/exhibitor/profile'
                }
                className="
                  mt-5
                  w-full
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  hover:bg-slate-50
                  hover:border-slate-300
                  transition
                "
              >
                <span>
                  Edit profile
                </span>

                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

            </div>
          </section>

          {/* SECURITY */}
          <section className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            overflow-hidden
          ">

            <div className="p-6">

              <div className="
                w-11
                h-11
                rounded-xl
                bg-amber-50
                text-amber-600
                flex
                items-center
                justify-center
                mb-4
              ">
                <Lock className="w-5 h-5" />
              </div>

              <h2 className="font-bold text-slate-900">
                Security
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Keep your EventSphere account secure.
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.href =
                    '/exhibitor/profile'
                }
                className="
                  mt-5
                  w-full
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  hover:bg-slate-50
                  hover:border-slate-300
                  transition
                "
              >
                <span>
                  Change password
                </span>

                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

            </div>
          </section>

          {/* MOBILE / INFO */}
          <section className="
            rounded-2xl
            border
            border-blue-100
            bg-blue-50/70
            p-6
          ">

            <div className="
              w-11
              h-11
              rounded-xl
              bg-white
              text-blue-600
              flex
              items-center
              justify-center
              shadow-sm
              mb-4
            ">
              <Smartphone className="w-5 h-5" />
            </div>

            <h2 className="font-bold text-slate-900">
              Stay connected
            </h2>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Keep notifications enabled so you don't
              miss application updates, event reminders
              or exhibitor messages.
            </p>

          </section>

        </div>
      </div>

      {/* =====================================================
          FOOTER NOTE
      ===================================================== */}

      <div className="
        mt-6
        flex
        items-center
        justify-center
        gap-2
        text-xs
        text-slate-400
      ">
        <Shield className="w-3.5 h-3.5" />
        Your preferences are saved automatically.
      </div>

    </div>
  )
}

export default ExhibitorSettings
