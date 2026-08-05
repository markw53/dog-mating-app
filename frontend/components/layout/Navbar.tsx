'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { Dog, LogOut, MessageSquare, User, PlusCircle, Menu, X, ChevronDown, ShieldCheck, Map, Heart } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useUnreadMessages } from '@/lib/hooks/useUnreadMessages';

function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span
      className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold"
      aria-label={`${count} unread message${count === 1 ? '' : 's'}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const unreadCount = useUnreadMessages();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debug log to see user role
  useEffect(() => {
  }, [user?.role]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Dog className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">DogMate</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-4">
            <li>
              <Link
                href="/browse"
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/browse'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Browse Dogs
              </Link>
            </li>

            <li>
              <Link
                href="/breeds"
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/breeds' || pathname.startsWith('/breeds/')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Breed Guide
              </Link>
            </li>

            <li>
              <Link
                href="/map"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${
                  pathname === '/map'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                <Map className="h-4 w-4" />
                <span>Map</span>
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === '/dashboard'
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    My Dogs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/messages"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${
                      pathname === '/messages'
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Messages</span>
                    <UnreadBadge count={unreadCount} />
                  </Link>
                </li>
                {/* Admin link - check for ADMIN role */}
                {user?.role === 'ADMIN' && (
                  <li>
                    <Link
                      href="/admin"
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${
                        pathname === '/admin'
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/dashboard/add-dog"
                    className="btn-primary flex items-center space-x-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Dog</span>
                  </Link>
                </li>

                {/* User Dropdown */}
                <li className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {user?.firstName || 'User'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {dropdownOpen && (
                    <ul className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                      <li>
                        <Link
                          href="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/favorites"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Heart className="h-4 w-4 text-pink-500" aria-hidden="true" />
                          Saved Dogs
                        </Link>
                      </li>
                      {/* Admin link in dropdown - check for ADMIN role */}
                      {user?.role === 'ADMIN' && (
                        <li>
                          <Link
                            href="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Admin Panel
                          </Link>
                        </li>
                      )}
                      <li>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className="btn-secondary">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="btn-primary">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

    {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <ul className="px-2 pt-2 pb-3 space-y-1">
            <li>
              <Link
                href="/browse"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                Browse Dogs
              </Link>
            </li>

            <li>
              <Link
                href="/breeds"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                Breed Guide
              </Link>
            </li>

            <li>
              <Link
                href="/map"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                <Map className="h-4 w-4" />
                Map View
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    My Dogs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    Messages
                    <UnreadBadge count={unreadCount} />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    Saved Dogs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    Profile
                  </Link>
                </li>
                {user?.role === 'ADMIN' && (
                  <li>
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                    >
                      Admin Panel
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-gray-50"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}