import {
  LayoutDashboard, CalendarDays, Building2, Grid3x3, Clock,
  ClipboardList, BarChart3, MessageSquare, Bell, Mail,
} from 'lucide-react'

export const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/exhibitors', label: 'Exhibitors', icon: Building2 },
  { to: '/admin/booths', label: 'Booths', icon: Grid3x3 },
  { to: '/admin/sessions', label: 'Sessions', icon: Clock },
  { to: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/contact-messages', label: 'Contact Messages', icon: Mail },
]

export const exhibitorNav = [
  { to: '/exhibitor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/exhibitor/profile', label: 'My Profile', icon: ClipboardList },
  { to: '/exhibitor/events', label: 'My Events', icon: CalendarDays },
  { to: '/exhibitor/applications', label: 'Applications', icon: ClipboardList },
  { to: '/exhibitor/booths', label: 'Booths', icon: Grid3x3 },
  { to: '/exhibitor/products', label: 'Products & Services', icon: Building2 },
  { to: '/exhibitor/messages', label: 'Messages', icon: MessageSquare },
]