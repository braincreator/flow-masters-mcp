'use client'

// Re-export all context hooks for easy access
export { useAuth } from '@/providers/AuthProvider'
export { useBlog } from '@/providers/BlogProvider'
export { useSearch } from '@/providers/SearchProvider'
export { useTheme } from '@/providers/Theme'
export { useLocale } from '@/providers/LocaleProvider'
export { useCache } from '@/providers/CacheProvider'
export { useI18n } from '@/providers/I18n'
export { useHeaderTheme } from '@/providers/HeaderTheme'
export { useDropdown } from '@/providers/DropdownContext'
export { useNotifications } from '@/providers/NotificationsProvider'
export { useCart } from '@/providers/CartProvider'
export { useFavorites } from '@/providers/FavoritesProvider'
export { useUserPreferences } from '@/providers/UserPreferencesProvider'
export { usePayloadAPI } from '@/providers/payload'

// Re-export selector hooks for optimized performance
export {
  useBlogSelector,
  useBlogPosts,
  useBlogComments,
  useBlogSearch,
  useBlogInteractions,
} from '@/hooks/useBlogSelector'

export {
  useSearchSelector,
  useSearchState,
  useSearchHistory,
  useSearchFilters,
  useSearchSuggestions,
} from '@/hooks/useSearchSelector'

export {
  useLocaleSelector,
  useCurrentLocale,
  useSupportedLocales,
  useLocalizedPaths,
  useLocaleFormatting,
} from '@/hooks/useLocaleSelector'

export {
  useNotificationsSelector,
  useNotificationsList,
  useToastNotifications,
  useNotificationActions,
  useUnreadCount,
  useNotificationsOfType,
  useNotificationsFilter,
} from '@/hooks/useNotificationsSelector'

export {
  useUserPreferencesSelector,
  useEmailNotificationPreferences,
  usePushNotificationPreferences,
  useAccessibilityPreferences,
  usePrivacyPreferences,
  useAppearancePreferences,
  useContentPreferences,
  useNotificationFrequency,
  useDisplayMode,
} from '@/hooks/useUserPreferencesSelector'

export {
  useCartSelector,
  useCartItems,
  useCartTotal,
  useCartActions,
  useCartStatus,
  useCartItem,
} from '@/hooks/useCartSelector'

export { useCheckout } from '@/providers/CheckoutProvider'

export {
  useCheckoutSelector,
  useCheckoutNavigation,
  useCheckoutAddresses,
  useCheckoutShipping,
  useCheckoutPayment,
  useCheckoutCoupon,
  useCheckoutTotals,
  useCheckoutOrder,
  useCheckoutCustomer,
} from '@/hooks/useCheckoutSelector'

export { useAnalytics } from '@/providers/AnalyticsProvider'

export {
  useAnalyticsSelector,
  useBasicTracking,
  useEcommerceTracking,
  useUserTracking,
  useContentTracking,
  useAnalyticsDebug,
  createComponentTracker,
} from '@/hooks/useAnalyticsSelector'

export { usePermissions } from '@/providers/PermissionsProvider'

export {
  usePermissionsSelector,
  usePermissionChecks,
  useUserRole,
  usePermissionGuard,
  useContentPermissions,
  useProductPermissions,
  useOrderPermissions,
  useAdminPermissions,
} from '@/hooks/usePermissionsSelector'

export { useMediaQuery } from '@/providers/MediaQueryProvider'

export {
  useMediaQuerySelector,
  useBreakpoints,
  useDeviceType,
  useOrientation,
  useMediaQueryUserPreferences,
  useViewportSize,
  useResponsiveValue,
} from '@/hooks/useMediaQuerySelector'

export { useForm } from '@/providers/FormProvider'

export {
  useFormSelector,
  useFormValues,
  useFormErrors,
  useFormSubmission,
  useFormValidation,
  useFormField,
} from '@/hooks/useFormSelector'

export { useError, ErrorBoundary } from '@/providers/ErrorProvider'

export {
  useErrorSelector,
  useErrorState,
  useErrorCapture,
  useErrorManagement,
  useErrorsBySeverity,
  useErrorsByCategory,
  useTryCatch,
} from '@/hooks/useErrorSelector'

export { useFeatureFlags } from '@/providers/FeatureFlagsProvider'

export {
  useFeatureFlagsSelector,
  useFeatureFlagsState,
  useFeatureFlagsMethods,
  useFeatureFlagsComponents,
  useFeature,
  useFeatures,
  useAllFeaturesEnabled,
  useAnyFeatureEnabled,
} from '@/hooks/useFeatureFlagsSelector'
