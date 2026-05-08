import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthForms from './features/auth/components/AuthForms';
import OnboardingModal, { useOnboarding } from './components/OnboardingModal.jsx';
import { useSimpleRouter } from './app/router/useSimpleRouter';
import { useInactivityLogout } from './hooks/useInactivityLogout';
import { useToast } from './components/ui/Toast.jsx';
const AdminPage = lazy(() => import('./pages/Admin'));
const ChatPage = lazy(() => import('./pages/Chat'));
const Home = lazy(() => import('./pages/Home'));
const ImportedChatPage = lazy(() => import('./pages/ImportedChat'));
const LandingPage = lazy(() => import('./pages/landing/BeyondStringsLanding.js'));
const ProfilePage = lazy(() => import('./pages/Profile'));
import { getActiveChatRouteId, setActiveChatRouteId } from './utils/chatRouteState';
import {
    logoutUser,
    refreshUserProfile,
    selectAuthInitialized,
    selectIsAdmin,
    selectIsAuthenticated,
    setResolvedAuthState
} from './store/authSlice';
import { selectThemePreference, setThemePreference } from './store/appSessionSlice';
import { loadUserProfile, subscribeAuthUser, syncUserChatMembership } from './services/firebase/socialService';

const DEFAULT_TITLE = 'BeyondStrings | Secure Real-Time Chat';
const DEFAULT_DESCRIPTION = 'Privacy-first real-time chat with replay controls, encrypted media, and AI-powered conversation insights.';
const DEFAULT_OG_IMAGE = '/og-image.svg';

function getPublicBaseUrl() {
    const configured = String(import.meta.env.PUBLIC_APP_URL || '').trim();
    if (configured) {
        return configured.replace(/\/$/, '');
    }
    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin;
    }
    return 'https://beyondstrings.app';
}

function upsertMeta(attr, key, content) {
    if (!content) {
        return;
    }
    let node = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!node) {
        node = document.createElement('meta');
        node.setAttribute(attr, key);
        document.head.appendChild(node);
    }
    node.setAttribute('content', content);
}

function removeMeta(attr, key) {
    const node = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (node) {
        node.remove();
    }
}

function upsertLink(rel, href) {
    if (!href) {
        return;
    }
    let node = document.head.querySelector(`link[rel="${rel}"]`);
    if (!node) {
        node = document.createElement('link');
        node.setAttribute('rel', rel);
        document.head.appendChild(node);
    }
    node.setAttribute('href', href);
}

function upsertJsonLd(scriptId, payload) {
    if (!payload) {
        return;
    }

    let node = document.head.querySelector(`script#${scriptId}[type="application/ld+json"]`);
    if (!node) {
        node = document.createElement('script');
        node.type = 'application/ld+json';
        node.id = scriptId;
        document.head.appendChild(node);
    }

    node.textContent = JSON.stringify(payload);
}

export default function RootApp() {
    const dispatch = useDispatch();
    const route = useSimpleRouter();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const { toast } = useToast();
    const isAdmin = useSelector(selectIsAdmin);
    const authInitialized = useSelector(selectAuthInitialized);
    const themePreference = useSelector(selectThemePreference);
    const resolvedTheme = themePreference === 'system' ? (prefersDark ? 'dark' : 'light') : themePreference;
    const [prefersDark, setPrefersDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
    const { show: showOnboarding, dismiss: dismissOnboarding } = useOnboarding();

    useEffect(() => {
        const baseUrl = getPublicBaseUrl();
        const googleVerification = String(import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION || '').trim();
        const bingVerification = String(import.meta.env.PUBLIC_BING_SITE_VERIFICATION || '').trim();

        const landingJsonLd = [
            {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'BeyondStrings',
                url: `${baseUrl}/`,
                logo: `${baseUrl}/apple-touch-icon.png`,
                description: DEFAULT_DESCRIPTION
            },
            {
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: 'BeyondStrings',
                category: 'Communication Software',
                image: `${baseUrl}${DEFAULT_OG_IMAGE}`,
                description: DEFAULT_DESCRIPTION,
                brand: {
                    '@type': 'Brand',
                    name: 'BeyondStrings'
                },
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                    availability: 'https://schema.org/InStock',
                    url: `${baseUrl}/`
                }
            },
            {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: [
                    {
                        '@type': 'Question',
                        name: 'Is BeyondStrings encrypted?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Yes. BeyondStrings applies encryption to protect conversation data and private messaging workflows.'
                        }
                    },
                    {
                        '@type': 'Question',
                        name: 'Can teams use BeyondStrings for group collaboration?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Yes. The app supports direct and group conversations, moderation controls, and role-based management.'
                        }
                    },
                    {
                        '@type': 'Question',
                        name: 'Does BeyondStrings include AI features?',
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: 'Yes. BeyondStrings includes AI-powered insights and summary capabilities to help users understand conversations faster.'
                        }
                    }
                ]
            }
        ];

        const routeSeo = {
            '/': {
                title: DEFAULT_TITLE,
                description: DEFAULT_DESCRIPTION,
                canonicalPath: '/',
                robots: 'index, follow, max-image-preview:large',
                jsonLd: landingJsonLd
            },
            '/landing': {
                title: DEFAULT_TITLE,
                description: DEFAULT_DESCRIPTION,
                canonicalPath: '/',
                robots: 'index, follow, max-image-preview:large',
                jsonLd: landingJsonLd
            },
            '/login': {
                title: 'Login | BeyondStrings',
                description: 'Sign in to BeyondStrings and continue secure, privacy-first conversations.',
                canonicalPath: '/login',
                robots: 'noindex, nofollow',
                jsonLd: null
            },
            '/sign-up': {
                title: 'Create Account | BeyondStrings',
                description: 'Create your BeyondStrings account to start encrypted real-time chat.',
                canonicalPath: '/sign-up',
                robots: 'noindex, nofollow',
                jsonLd: null
            }
        };

        const fallbackSeo = {
            title: DEFAULT_TITLE,
            description: DEFAULT_DESCRIPTION,
            canonicalPath: '/',
            robots: 'noindex, nofollow',
            jsonLd: null
        };

        const resolvedSeo = routeSeo[route.path] || fallbackSeo;
        const canonicalUrl = `${baseUrl}${resolvedSeo.canonicalPath}`;
        const ogImage = `${baseUrl}${DEFAULT_OG_IMAGE}`;

        document.title = resolvedSeo.title;
        upsertMeta('name', 'description', resolvedSeo.description);
        upsertMeta('name', 'robots', resolvedSeo.robots);
        upsertMeta('property', 'og:title', resolvedSeo.title);
        upsertMeta('property', 'og:description', resolvedSeo.description);
        upsertMeta('property', 'og:url', canonicalUrl);
        upsertMeta('property', 'og:image', ogImage);
        upsertMeta('name', 'twitter:title', resolvedSeo.title);
        upsertMeta('name', 'twitter:description', resolvedSeo.description);
        upsertMeta('name', 'twitter:image', ogImage);
        upsertLink('canonical', canonicalUrl);

        if (googleVerification) upsertMeta('name', 'google-site-verification', googleVerification);
        else removeMeta('name', 'google-site-verification');

        if (bingVerification) upsertMeta('name', 'msvalidate.01', bingVerification);
        else removeMeta('name', 'msvalidate.01');

        if (resolvedSeo.jsonLd) {
            upsertJsonLd('route-jsonld', resolvedSeo.jsonLd);
        } else {
            const ldNode = document.head.querySelector('script#route-jsonld[type="application/ld+json"]');
            if (ldNode) ldNode.remove();
        }
    }, [route.path]);

    // Keep data-theme in sync across all pages
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => setPrefersDark(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedTheme);
    }, [resolvedTheme]);

    useEffect(() => {
        const unsubscribe = subscribeAuthUser(async (firebaseUser) => {
            if (!firebaseUser) {
                dispatch(setResolvedAuthState({ user: null, profile: null }));
                return;
            }

            const nextProfile = await loadUserProfile(firebaseUser.uid);
            syncUserChatMembership(firebaseUser.uid).catch(() => {
                // Non-blocking warmup for user chat sidebar data.
            });
            dispatch(
                setResolvedAuthState({
                    user: { uid: firebaseUser.uid, email: firebaseUser.email || '' },
                    profile: nextProfile
                })
            );
            dispatch(refreshUserProfile(firebaseUser.uid));
        });

        return unsubscribe;
    }, [dispatch]);

    useEffect(() => {
        if (!authInitialized) {
            return;
        }

        const isProtectedPath = route.path === '/home' || route.path === '/profile' || route.path === '/chat' || route.path.startsWith('/chat/') || route.path.startsWith('/imported/') || route.path === '/admin';

        if (!isAuthenticated && isProtectedPath) {
            route.navigate('/', { replace: true });
        }

        if (isAuthenticated && (route.path === '/' || route.path === '/landing' || route.path === '/login')) {
            route.navigate('/home', { replace: true });
        }

        if (route.path === '/admin' && isAuthenticated && !isAdmin) {
            route.navigate('/home', { replace: true });
        }
    }, [authInitialized, isAdmin, isAuthenticated, route]);

    useEffect(() => {
        if (!route.path.startsWith('/chat/')) {
            return;
        }

        const routeChatId = decodeURIComponent(route.path.replace('/chat/', '') || '').trim();
        if (!routeChatId) {
            route.navigate('/home', { replace: true });
            return;
        }

        setActiveChatRouteId(routeChatId);
        route.navigate('/chat', { replace: true });
    }, [route]);

    const handleLogout = useCallback(async () => {
        await dispatch(logoutUser());
        route.navigate('/', { replace: true });
    }, [dispatch, route]);

    const handleInactivityWarning = useCallback(() => {
        toast('You will be logged out in 1 minute due to inactivity.', 'info', 60000);
    }, [toast]);

    useInactivityLogout({
        enabled: isAuthenticated,
        onLogout: handleLogout,
        onWarning: handleInactivityWarning,
    });

    const loadingFallback = (
        <div className="grid min-h-[100svh] place-items-center bg-[var(--page-bg)] text-[var(--text-main)]">
            <div className="rounded-[1.4rem] border border-[var(--border-soft)] bg-[var(--panel-soft)] px-5 py-4 text-sm">Loading page...</div>
        </div>
    );

    if (!authInitialized) {
        return (
            <div className="grid min-h-[100svh] place-items-center bg-[var(--page-bg)] text-[var(--text-main)]">
                <div className="rounded-[1.4rem] border border-[var(--border-soft)] bg-[var(--panel-soft)] px-5 py-4 text-sm">Loading account session...</div>
            </div>
        );
    }

    if (route.path === '/admin') {
        return <Suspense fallback={loadingFallback}><AdminPage navigate={route.navigate} /></Suspense>;
    }

    if (route.path === '/chat') {
        return <Suspense fallback={loadingFallback}><ChatPage chatId={getActiveChatRouteId()} navigate={route.navigate} onLogout={handleLogout} /></Suspense>;
    }

    if (route.path.startsWith('/imported/')) {
        const importedId = decodeURIComponent(route.path.replace('/imported/', '') || '');
        return <Suspense fallback={loadingFallback}><ImportedChatPage importedId={importedId} navigate={route.navigate} onLogout={handleLogout} /></Suspense>;
    }

    if (route.path === '/home') {
        return <Suspense fallback={loadingFallback}><Home navigate={route.navigate} onLogout={handleLogout} /></Suspense>;
    }

    if (route.path === '/profile') {
        return <Suspense fallback={loadingFallback}><ProfilePage navigate={route.navigate} onLogout={handleLogout} /></Suspense>;
    }

    if (route.path === '/' || route.path === '/landing') {
        return (
            <Suspense fallback={loadingFallback}>
                <LandingPage
                    onSignIn={() => route.navigate('/login')}
                    onSignUp={() => route.navigate('/sign-up')}
                    themeMode={resolvedTheme}
                    onToggleTheme={() => {
                        dispatch(setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark'));
                    }}
                    onSelectAction={(action) => {
                        if (action === 'live') route.navigate('/login');
                        else if (action === 'import') route.navigate('/login');
                        else if (action === 'analyze') route.navigate('/login');
                    }}
                />
            </Suspense>
        );
    }

    if (route.path === '/login' || route.path === '/sign-up') {
        return (
            <>
                {isAuthenticated && showOnboarding && <OnboardingModal onDone={dismissOnboarding} />}
                <AuthForms onAuthenticated={() => route.navigate('/home')} />
            </>
        );
    }

    return (
        <>
            {isAuthenticated && showOnboarding && <OnboardingModal onDone={dismissOnboarding} />}
            <AuthForms onAuthenticated={() => route.navigate('/home')} />
        </>
    );
}