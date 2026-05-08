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

        // @graph bundles all page schemas in one valid ld+json block.
        // Google processes @graph correctly; bare arrays are non-standard.
        const landingJsonLd = {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'WebSite',
                    '@id': `${baseUrl}/#website`,
                    url: `${baseUrl}/`,
                    name: 'BeyondStrings',
                    description: DEFAULT_DESCRIPTION,
                    publisher: { '@id': `${baseUrl}/#organization` },
                    inLanguage: 'en-US',
                    potentialAction: {
                        '@type': 'SearchAction',
                        target: {
                            '@type': 'EntryPoint',
                            urlTemplate: `${baseUrl}/?q={search_term_string}`
                        },
                        'query-input': 'required name=search_term_string'
                    }
                },
                {
                    '@type': 'Organization',
                    '@id': `${baseUrl}/#organization`,
                    name: 'BeyondStrings',
                    url: `${baseUrl}/`,
                    logo: {
                        '@type': 'ImageObject',
                        '@id': `${baseUrl}/#logo`,
                        url: `${baseUrl}/apple-touch-icon.png`,
                        width: 180,
                        height: 180,
                        caption: 'BeyondStrings'
                    },
                    image: { '@id': `${baseUrl}/#logo` },
                    description: DEFAULT_DESCRIPTION,
                    contactPoint: {
                        '@type': 'ContactPoint',
                        contactType: 'customer support',
                        email: 'hello@beyondstrings.ai',
                        availableLanguage: 'English'
                    }
                },
                {
                    '@type': 'SoftwareApplication',
                    '@id': `${baseUrl}/#product`,
                    name: 'BeyondStrings',
                    applicationCategory: 'CommunicationApplication',
                    applicationSubCategory: 'Encrypted Messaging',
                    operatingSystem: 'Web, iOS, Android',
                    url: `${baseUrl}/`,
                    description: DEFAULT_DESCRIPTION,
                    featureList: 'Encrypted real-time messaging, AI conversation insights, Conversation replay controls, Group chat with roles, Smart message search, Encrypted media sharing, Web Push notifications, Analytics dashboard',
                    screenshot: `${baseUrl}${DEFAULT_OG_IMAGE}`,
                    publisher: { '@id': `${baseUrl}/#organization` },
                    aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: '5',
                        reviewCount: '3',
                        bestRating: '5',
                        worstRating: '1'
                    },
                    offers: [
                        {
                            '@type': 'Offer',
                            name: 'Free',
                            price: '0',
                            priceCurrency: 'USD',
                            description: '1,000 messages/mo, 3 integrations, Basic AI Summaries',
                            availability: 'https://schema.org/InStock',
                            url: `${baseUrl}/`
                        },
                        {
                            '@type': 'Offer',
                            name: 'Pro',
                            price: '25',
                            priceCurrency: 'USD',
                            description: '50,000 messages/mo, Unlimited integrations, Advanced Smart Search, API Access',
                            availability: 'https://schema.org/InStock',
                            url: `${baseUrl}/`
                        },
                        {
                            '@type': 'Offer',
                            name: 'Premium',
                            price: '53',
                            priceCurrency: 'USD',
                            description: 'Unlimited everything, Custom Model Training, Priority Support, SSO and Enterprise Security',
                            availability: 'https://schema.org/InStock',
                            url: `${baseUrl}/`
                        }
                    ]
                },
                {
                    '@type': 'FAQPage',
                    '@id': `${baseUrl}/#faq`,
                    mainEntity: [
                        {
                            '@type': 'Question',
                            name: 'Is BeyondStrings free to use?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Yes. BeyondStrings has a free plan that includes 1,000 messages per month, 3 integrations, and basic AI summaries — no credit card required.'
                            }
                        },
                        {
                            '@type': 'Question',
                            name: 'Is BeyondStrings encrypted?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Yes. BeyondStrings encrypts messages and media to protect your conversations and private messaging workflows.'
                            }
                        },
                        {
                            '@type': 'Question',
                            name: 'What AI features does BeyondStrings include?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'BeyondStrings includes AI-powered conversation summaries, sentiment analysis, smart keyword search, and an insights dashboard that surfaces key topics and trends from your team communications.'
                            }
                        },
                        {
                            '@type': 'Question',
                            name: 'Does BeyondStrings support group chats?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Yes. BeyondStrings supports group chat with role-based moderation (owner, admin, member), join requests, approval flows, and member management.'
                            }
                        },
                        {
                            '@type': 'Question',
                            name: 'Can I replay past conversations?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Yes. BeyondStrings has a conversation replay feature that lets you relive any conversation timeline with AI-generated summaries and context tags.'
                            }
                        },
                        {
                            '@type': 'Question',
                            name: 'Is there a mobile app for BeyondStrings?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'BeyondStrings is a Progressive Web App (PWA) that works on any device — desktop, iOS, and Android — directly from your browser with offline support.'
                            }
                        },
                        {
                            '@type': 'Question',
                            name: 'How does BeyondStrings compare to Slack or Discord?',
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: 'Unlike Slack or Discord, BeyondStrings focuses on AI-powered conversation intelligence — summaries, replay, and semantic search — so your team retains and acts on the knowledge inside your chats.'
                            }
                        }
                    ]
                }
            ]
        };

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