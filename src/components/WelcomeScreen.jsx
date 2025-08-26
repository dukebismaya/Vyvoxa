import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Heart,
  Users,
  Share2,
  Bell,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: "Connect & Share",
    description: "Share your thoughts, photos, and moments with the community"
  },
  {
    icon: Users,
    title: "Follow Friends", 
    description: "Stay updated with posts from people you care about"
  },
  {
    icon: Share2,
    title: "Engage",
    description: "Like, comment, and interact with posts that interest you"
  },
  {
    icon: Bell,
    title: "Stay Updated",
    description: "Get notifications for interactions and new content"
  }
];

export default function WelcomeScreen({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 shadow-2xl mb-6"
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Welcome to{' '}
            <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
              Vyvoxa
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Connect, share, and discover amazing content with a community that values authentic connections
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <Card className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-fuchsia-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="rounded-3xl px-8 py-6 text-lg bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:from-fuchsia-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Join thousands of users sharing their stories
          </p>
        </motion.div>

        {/* Demo Accounts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-12"
        >
          <Card className="rounded-3xl border-dashed border-2 border-muted">
            <CardHeader>
              <CardTitle className="text-center text-lg">Try Demo Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-muted/50 rounded-2xl p-4">
                  <div className="font-mono mb-1">demo@vyvoxa.com</div>
                  <div className="font-mono text-muted-foreground">demo123</div>
                </div>
                <div className="bg-muted/50 rounded-2xl p-4">
                  <div className="font-mono mb-1">test@example.com</div>
                  <div className="font-mono text-muted-foreground">test123</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Use these accounts to explore Vyvoxa without creating your own
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
