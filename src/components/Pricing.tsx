import React, { useState } from 'react';
import { Check, CreditCard, Zap, ShieldCheck, Globe, MessageSquare, FileSearch, FilePlus, Loader2, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';
import { notificationService } from '../services/notificationService';
import { paymentService, Currency, PaymentProvider } from '../services/paymentService';
import { auth } from '../firebase';

export function Pricing() {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>('UZS');

  const handleUpgrade = async (planName: string, amount: number, provider: PaymentProvider) => {
    if (!auth.currentUser) {
      notificationService.notifyError('Iltimos, avval tizimga kiring.');
      return;
    }

    setIsProcessing(`${planName}-${provider}`);
    try {
      const url = paymentService.generatePaymentLink(provider, {
        amount,
        currency,
        planId: planName.toLowerCase(),
        userId: auth.currentUser.uid
      });
      
      notificationService.notify(
        'To\'lov tayyor',
        `${provider.toUpperCase()} orqali xavfsiz to'lov sahifasiga yo'naltirilmoqda...`,
        'info'
      );

      // In a real app, we would redirect:
      window.open(url, '_blank');
      
      // For demo purposes, we simulate success after a delay
      setTimeout(() => {
        setIsProcessing(null);
        notificationService.notifyPlanUpgraded(planName);
      }, 3000);

    } catch (error) {
      console.error(error);
      notificationService.notifyError('To\'lovni amalga oshirib bo\'lmadi. Iltimos qaytadan urinib ko\'ring.');
      setIsProcessing(null);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: { UZS: 0, USD: 0 },
      description: 'Basic legal assistance for individuals.',
      features: [
        'Limited legal Q&A',
        'Basic document analysis',
        'Uzbek language support',
        '1 document generation/mo',
      ],
      icon: MessageSquare,
      color: 'text-zinc-500 bg-zinc-500/10',
      buttonText: 'Current Plan',
      isCurrent: true,
    },
    {
      name: 'Basic',
      price: { UZS: 49000, USD: 4.99 },
      description: 'Enhanced features for regular users.',
      features: [
        'Unlimited legal Q&A',
        'Full document analysis',
        'Multilingual support',
        '5 document generations/mo',
        'Risk detection score',
      ],
      icon: Zap,
      color: 'text-blue-600 bg-blue-600/10',
      buttonText: 'Upgrade Now',
      isCurrent: false,
    },
    {
      name: 'Pro',
      price: { UZS: 149000, USD: 14.99 },
      description: 'Professional tools for small businesses.',
      features: [
        'Everything in Basic',
        'Unlimited document generation',
        'Advanced risk analysis',
        'Priority support',
        'PDF downloads',
      ],
      icon: ShieldCheck,
      color: 'text-purple-600 bg-purple-600/10',
      buttonText: 'Go Pro',
      isCurrent: false,
    },
    {
      name: 'Max',
      price: { UZS: 499000, USD: 49.99 },
      description: 'Enterprise-grade legal AI solution.',
      features: [
        'Everything in Pro',
        'API Access',
        'Custom legal templates',
        'Team collaboration',
        'Dedicated legal consultant',
      ],
      icon: Globe,
      color: 'text-amber-600 bg-amber-600/10',
      buttonText: 'Contact Sales',
      isCurrent: false,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto custom-scrollbar p-6">
      <div className="max-w-6xl mx-auto w-full space-y-12 py-8">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">Choose Your Plan</h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Unlock the full potential of Adolat AI with our flexible subscription plans. 
            Empower your legal decisions with advanced AI.
          </p>
          
          <div className="flex items-center justify-center gap-2 p-1 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-fit mx-auto">
            <button
              onClick={() => setCurrency('UZS')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                currency === 'UZS' ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              UZS
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                currency === 'USD' ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              USD
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col space-y-6 transition-all hover:shadow-xl hover:-translate-y-1",
                plan.isCurrent && "ring-2 ring-blue-600"
              )}
            >
              <div className="space-y-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", plan.color)}>
                  <plan.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{plan.description}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-zinc-900 dark:text-white">
                    {currency === 'UZS' ? plan.price.UZS.toLocaleString() : plan.price.USD}
                  </span>
                  <span className="text-sm text-zinc-500 font-medium">{currency}/mo</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <Check size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {!plan.isCurrent && (
                  <>
                    {currency === 'UZS' ? (
                      <>
                        <button
                          onClick={() => handleUpgrade(plan.name, plan.price[currency], 'payme')}
                          disabled={isProcessing !== null}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                        >
                          {isProcessing === `${plan.name}-payme` ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <>
                              <CreditCard size={18} />
                              Pay with Payme
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleUpgrade(plan.name, plan.price[currency], 'click')}
                          disabled={isProcessing !== null}
                          className="w-full py-3 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                        >
                          {isProcessing === `${plan.name}-click` ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <>
                              <Zap size={18} className="text-yellow-400" />
                              Pay with Click
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleUpgrade(plan.name, plan.price[currency], 'bank')}
                          disabled={isProcessing !== null}
                          className="w-full py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                        >
                          {isProcessing === `${plan.name}-bank` ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <>
                              <CreditCard size={18} className="text-zinc-400" />
                              Bank Card
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.name, plan.price[currency], 'usd_link')}
                        disabled={isProcessing !== null}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 disabled:opacity-50"
                      >
                        {isProcessing === `${plan.name}-usd_link` ? (
                          <Loader2 size={24} className="animate-spin" />
                        ) : (
                          <>
                            <DollarSign size={24} />
                            Pay with Link.com
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
                {plan.isCurrent && (
                  <div className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl font-bold text-center cursor-default">
                    Current Plan
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 dark:bg-zinc-800 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold">Secure Payments</h3>
            <p className="text-zinc-400 text-sm">We support Payme, Click, and all major payment links in Uzbekistan.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <CreditCard size={20} className="text-blue-400" />
              <span className="font-bold">Payme</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <Zap size={20} className="text-yellow-400" />
              <span className="font-bold">Click</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
