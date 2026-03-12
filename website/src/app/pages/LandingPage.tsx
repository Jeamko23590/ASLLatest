import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Logo } from '@/app/components/Logo';
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Users, 
  GraduationCap,
  BookOpen,
  Brain,
  Award,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowUp,
  Mail
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToLogin: (role?: 'teacher' | 'admin') => void;
}

export function LandingPage({ onNavigateToLogin }: LandingPageProps) {
  const developers = [
    { 
      name: 'Yoej Mendoza', 
      role: 'Project Lead',
      expertise: 'Team Senyamatika',
      email: 'yoejmendoza03@gmail.com',
      image: 'https://rzadlczsnbsbmlkhbsum.supabase.co/storage/v1/object/public/resources/images_team/Yoej%20Mendoza.jpg',
      gradient: 'from-[#8B6F47] to-[#6B5539]'
    },
    { 
      name: 'Rochelle Margarett Abueva', 
      role: 'Project Contributor',
      expertise: 'Team Senyamatika',
      email: 'rochellemargarettabueva@gmail.com',
      image: 'https://rzadlczsnbsbmlkhbsum.supabase.co/storage/v1/object/public/resources/images_team/Rochelle%20Margarett%20Abueva.jpg',
      gradient: 'from-[var(--primary)] to-[var(--primary)]/80'
    },
    { 
      name: 'Jake Luis Baraquiel', 
      role: 'Project Contributor',
      expertise: 'Team Senyamatika',
      email: 'jakeluisbaraquiel@gmail.com',
      image: 'https://rzadlczsnbsbmlkhbsum.supabase.co/storage/v1/object/public/resources/images_team/Jake%20Luis%20Baraquiel.jpg',
      gradient: 'from-[var(--primary)] to-[#6B5539]'
    },
    { 
      name: 'Randel Jun Santos', 
      role: 'Project Contributor',
      expertise: 'Team Senyamatika',
      email: 'randelsantos002@gmail.com',
      image: 'https://rzadlczsnbsbmlkhbsum.supabase.co/storage/v1/object/public/resources/images_team/Randel%20Jun%20Santos.jpeg',
      gradient: 'from-[#A67C52] to-[#8B6F47]'
    }
  ];

  const benefits = [
    {
      icon: <Users className="h-8 w-8" />,
      title: 'For Teachers',
      description: 'Monitor student progress in real-time, track lesson completion, and access AI-powered insights to improve teaching strategies.'
    },
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: 'For Researchers',
      description: 'Analyze learning patterns, generate comprehensive reports, and gain data-driven insights into SPED education effectiveness.'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'For Schools',
      description: 'Centralized management of accounts, classes, and lessons with detailed analytics to support inclusive mathematics education.'
    }
  ];

  const features = [
    { 
      icon: <BookOpen className="h-6 w-6" />, 
      text: 'Lesson Tracking',
      description: 'Track lesson completion rates, time spent, and progress across all students and classes in real-time.'
    },
    { 
      icon: <Users className="h-6 w-6" />, 
      text: 'Student Management',
      description: 'Manage student profiles, monitor individual performance, and identify students who need additional support.'
    },
    { 
      icon: <Brain className="h-6 w-6" />, 
      text: 'AI Insights',
      description: 'Get intelligent recommendations and predictive analytics to optimize teaching strategies and student outcomes.'
    },
    { 
      icon: <BarChart3 className="h-6 w-6" />, 
      text: 'Visual Analytics',
      description: 'Access comprehensive charts and graphs that make complex data easy to understand and actionable.'
    }
  ];

  const stats = [
    { value: '20+', label: 'Active Students' },
    { value: '95%', label: 'Engagement Rate', showArrow: true },
    { value: '10+', label: 'Lessons Available' },
    { value: '24/7', label: 'Monitoring' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  };

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          {/* Logo - responsive sizing */}
          <div className="flex items-center min-w-0">
            <div className="hidden sm:block">
              <Logo size="md" showText={true} />
            </div>
            <div className="block sm:hidden">
              <Logo size="sm" showText={true} />
            </div>
          </div>
          
          {/* Login Button - responsive sizing */}
          <Button 
            onClick={() => onNavigateToLogin()}
            size="sm"
            className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 text-xs sm:text-sm px-3 sm:px-4 flex-shrink-0"
          >
            Login
            <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated CSS Gradient Background */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FEDA5E]/30 via-[#C4A661]/20 to-[#8B6F47]/30 animate-gradient-shift" />
          <div className="absolute inset-0 bg-gradient-to-tl from-[#8B6F47]/20 via-transparent to-[#FEDA5E]/20 animate-gradient-shift-reverse" />
          
          {/* Animated blob shapes */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#FEDA5E]/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#C4A661]/25 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 30, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#8B6F47]/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32 z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/20 rounded-full mb-6 border border-[var(--accent)]/30"
              >
                <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                <span className="text-sm font-medium text-[var(--primary)]">Inclusive Education Platform</span>
              </motion.div>

              <h1 className="heading-font text-5xl md:text-6xl lg:text-7xl text-[var(--primary)] mb-6 leading-tight">
                Centralized Monitoring for{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">Inclusive</span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="absolute bottom-2 left-0 w-full h-3 bg-[var(--accent)]/40 -z-0"
                  />
                </span>{' '}
                Education
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                SenyamatiKard is a comprehensive monitoring and reporting dashboard for the Senyamatika mobile app that teaches Functional Mathematics to Deaf and SPED students.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button 
                  onClick={() => onNavigateToLogin()}
                  size="lg"
                  className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--accent-foreground)] text-lg px-8 py-6 h-auto shadow-2xl hover:shadow-[var(--accent)]/30 transition-all hover:scale-105 group"
                >
                  Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  onClick={scrollToAbout}
                  variant="outline"
                  size="lg"
                  className="border-2 border-[var(--primary)] text-[var(--primary)] hover:text-[var(--primary)] text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-transparent hover:bg-transparent"
                >
                  Learn More
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="grid grid-cols-2 gap-6"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  className="bg-card/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-border shadow-lg hover:shadow-2xl hover:border-[var(--primary)] transition-all cursor-default"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1, type: "spring", bounce: 0.5 }}
                    className="heading-font text-4xl md:text-5xl text-[var(--primary)] mb-2"
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  {stat.showArrow && <ArrowUp className="absolute top-2 right-2 h-4 w-4 text-[var(--primary)]" />}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* About the Dashboard */}
      <section className="py-32 bg-gradient-to-br from-[var(--primary)] via-[var(--primary)] to-[#6B5539] relative overflow-hidden" id="about-section">
        {/* Enhanced background effects */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)] rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--accent-blue)] rounded-full blur-3xl"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUpVariants}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            <h2 className="heading-font text-4xl md:text-5xl lg:text-6xl text-white mb-6 drop-shadow-lg">
              About the Dashboard
            </h2>
            <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed">
              SenyamatiKard provides a centralized platform for monitoring student progress, analyzing learning patterns, and generating actionable insights for inclusive mathematics education.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Card 1 - Real-Time Monitoring */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -12 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Card className="border-0 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all h-full overflow-hidden bg-white/95 backdrop-blur-sm">
                <CardContent className="p-10 text-center h-full flex flex-col relative">
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/0 to-[var(--accent-blue)]/0 group-hover:from-[var(--accent)]/10 group-hover:to-[var(--accent-blue)]/10 transition-all duration-500" />
                  
                  {/* Decorative top bar */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-blue)]"
                  />
                  
                  <motion.div
                    animate={{ rotate: 0, scale: 1 }}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-shadow z-10"
                  >
                    <BarChart3 className="h-12 w-12 text-[var(--accent-foreground)]" />
                  </motion.div>
                  
                  <h3 className="relative text-2xl font-bold text-[var(--primary)] mb-4 z-10">
                    Real-Time Monitoring
                  </h3>
                  
                  <p className="relative text-muted-foreground leading-relaxed flex-grow mb-6 z-10">
                    Track student progress, lesson completion rates, and assessment scores with live analytics and visual dashboards.
                  </p>
                  
                  {/* Static badge bottom element */}
                  <div className="relative mt-auto pt-4 border-t border-border/50 z-10">
                    <div className="inline-flex items-center justify-center px-4 py-2 bg-[var(--primary)] rounded-full">
                      <span className="text-xs font-bold text-white">Live Analytics</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 2 - Comprehensive Reports */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -12 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Card className="border-0 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all h-full overflow-hidden bg-white/95 backdrop-blur-sm">
                <CardContent className="p-10 text-center h-full flex flex-col relative">
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-blue)]/0 to-[var(--accent)]/0 group-hover:from-[var(--accent-blue)]/10 group-hover:to-[var(--accent)]/10 transition-all duration-500" />
                  
                  {/* Decorative top bar */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent)]"
                  />
                  
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-blue)]/80 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-shadow z-10"
                  >
                    <FileText className="h-12 w-12 text-[var(--primary)]" />
                  </motion.div>
                  
                  <h3 className="relative text-2xl font-bold text-[var(--primary)] mb-4 z-10">
                    Data Reports
                  </h3>
                  
                  <p className="relative text-muted-foreground leading-relaxed flex-grow mb-6 z-10">
                    Generate detailed reports on class performance, individual progress, and engagement metrics for data-driven decisions.
                  </p>
                  
                  {/* Static badge bottom element */}
                  <div className="relative mt-auto pt-4 border-t border-border/50 z-10">
                    <div className="inline-flex items-center justify-center px-4 py-2 bg-[var(--primary)] rounded-full">
                      <span className="text-xs font-bold text-white">Detailed Insights</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 3 - AI-Powered Analytics */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -12 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Card className="border-0 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all h-full overflow-hidden bg-white/95 backdrop-blur-sm">
                <CardContent className="p-10 text-center h-full flex flex-col relative">
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/0 to-[var(--primary)]/0 group-hover:from-[var(--accent)]/10 group-hover:to-[var(--primary)]/10 transition-all duration-500" />
                  
                  {/* Decorative top bar */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)]"
                  />
                  
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-shadow z-10"
                  >
                    <TrendingUp className="h-12 w-12 text-[var(--accent-foreground)]" />
                  </motion.div>
                  
                  <h3 className="relative text-2xl font-bold text-[var(--primary)] mb-4 z-10">
                    AI-Powered Analytics
                  </h3>
                  
                  <p className="relative text-muted-foreground leading-relaxed flex-grow mb-6 z-10">
                    Access intelligent insights and descriptive analytics powered by AI to identify learning patterns and improvement areas.
                  </p>
                  
                  {/* Static badge bottom element */}
                  <div className="relative mt-auto pt-4 border-t border-border/50 z-10">
                    <div className="inline-flex items-center justify-center px-4 py-2 bg-[var(--primary)] rounded-full">
                      <span className="text-xs font-bold text-white">Smart Predictions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why SenyamatiKard */}
      <section className="py-24 bg-gradient-to-b from-background to-[var(--accent-blue)]/5 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 50,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUpVariants}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 rounded-2xl flex items-center justify-center shadow-xl">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            <h2 className="heading-font text-4xl md:text-5xl lg:text-6xl text-[var(--primary)] mb-4">
              Why SenyamatiKard?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Designed specifically for inclusive education with accessibility, usability, and data-driven insights at its core.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -12 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <Card className="border-0 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all h-full overflow-hidden bg-white/95 backdrop-blur-sm">
                  <CardContent className="p-10 h-full flex flex-col relative">
                    {/* Gradient background on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/0 to-[var(--accent-blue)]/0 group-hover:from-[var(--accent)]/10 group-hover:to-[var(--accent-blue)]/10 transition-all duration-500" />
                    
                    {/* Decorative top bar */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                      className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-blue)]"
                    />
                    
                    <motion.div
                      animate={{ rotate: 0, scale: 1 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className="relative w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-blue)] flex items-center justify-center text-[var(--accent-foreground)] shadow-xl group-hover:shadow-2xl transition-shadow z-10"
                    >
                      {benefit.icon}
                    </motion.div>
                    
                    <h3 className="relative text-2xl font-bold text-[var(--primary)] mb-4 z-10">
                      {benefit.title}
                    </h3>
                    
                    <p className="relative text-muted-foreground leading-relaxed flex-grow mb-6 z-10">
                      {benefit.description}
                    </p>
                    
                    {/* Static badge bottom element */}
                    <div className="relative mt-auto pt-4 border-t border-border/50 z-10">
                      <div className="inline-flex items-center justify-center px-4 py-2 bg-[var(--primary)] rounded-full">
                        <span className="text-xs font-bold text-white">
                          {index === 0 ? 'Track Progress' : index === 1 ? 'Generate Reports' : 'Manage Accounts'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -12, scale: 1.05 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="group cursor-default"
              >
                <div className="relative bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl rounded-2xl p-8 transition-all duration-300 h-full overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/0 to-[var(--accent-blue)]/0 group-hover:from-[var(--accent)]/10 group-hover:to-[var(--accent-blue)]/10 rounded-2xl transition-all duration-500" />
                  
                  {/* Decorative top bar */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-blue)]"
                  />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center text-center gap-4">
                    {/* Icon */}
                    <motion.div
                      animate={{ rotate: 0 }}
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="h-14 w-14 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-blue)] rounded-xl flex items-center justify-center text-[var(--primary)] shadow-lg group-hover:shadow-xl transition-shadow"
                    >
                      {feature.icon}
                    </motion.div>

                    {/* Title */}
                    <h3 className="font-bold text-base text-[var(--primary)] leading-snug">
                      {feature.text}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Meet the Developers */}
      <section className="py-24 bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-5" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUpVariants}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[var(--primary)] to-[#6B5539] rounded-2xl flex items-center justify-center shadow-xl">
                <Users className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            <h2 className="heading-font text-4xl md:text-5xl lg:text-6xl text-[var(--primary)] mb-4">
              Meet the Developers
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A dedicated team passionate about creating accessible educational technology for inclusive learning.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {developers.map((dev, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -12, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <Card className="border-0 shadow-xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all h-full overflow-hidden bg-white/95 backdrop-blur-sm relative">
                  {/* Left vertical accent bar - unique to this section */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                    className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${dev.gradient} z-20`}
                  />
                  
                  <CardContent className="p-8 text-center relative h-full flex flex-col">
                    {/* Gradient background on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${dev.gradient} opacity-0 group-hover:opacity-5 transition-all duration-500`} />
                    
                    {/* Decorative corner accent - top right */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-border/30 group-hover:border-[var(--primary)]/50 transition-colors rounded-tr-xl z-10"
                    />
                    
                    {/* Profile Badge with enhanced styling */}
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5 }}
                      className="relative mx-auto mb-6 z-10"
                    >
                      <div className={`relative w-28 h-28 rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-shadow`}>
                        {/* Profile Image */}
                        <img 
                          src={dev.image} 
                          alt={dev.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${dev.gradient} opacity-0 group-hover:opacity-20 transition-all`} />
                        
                        {/* Outer decorative ring with marching dashes */}
                        <svg
                          className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)]"
                          style={{ left: '-8px', top: '-8px' }}
                        >
                          <rect
                            x="4"
                            y="4"
                            width="calc(100% - 8px)"
                            height="calc(100% - 8px)"
                            rx="24"
                            ry="24"
                            fill="none"
                            stroke="rgba(139, 111, 71, 0.5)"
                            strokeWidth="2"
                            strokeDasharray="6 6"
                            className="group-hover:stroke-[var(--primary)] transition-all"
                            style={{
                              animation: 'marchingDashes 1s linear infinite'
                            }}
                          />
                        </svg>
                      </div>
                    </motion.div>
                    
                    {/* Text content with improved hierarchy */}
                    <div className="relative z-10 flex-grow flex flex-col">
                      <h3 className="text-2xl font-bold text-[var(--primary)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                        {dev.name}
                      </h3>
                      
                      <p className="text-sm font-semibold text-[var(--primary)]/80 mb-1">
                        {dev.role}
                      </p>
                      
                      <p className="text-xs text-muted-foreground font-medium mb-6">
                        {dev.expertise}
                      </p>
                      
                      {/* Expertise badge at bottom */}
                      <div className="mt-auto pt-4 border-t border-border/30 group-hover:border-[var(--primary)]/30 transition-colors">
                        <a 
                          href={`mailto:${dev.email}`}
                          className={`inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r ${dev.gradient} rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105`}
                        >
                          <Mail className="h-3.5 w-3.5 text-white mr-2" />
                          <span className="text-xs font-bold text-white">Contact Me</span>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[var(--accent-blue)]/20 via-[var(--accent)]/10 to-background relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--accent)] rounded-full blur-3xl"
          />
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariants}
          className="relative max-w-4xl mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[var(--accent)] to-[var(--accent-blue)] rounded-2xl flex items-center justify-center shadow-xl">
              <Sparkles className="h-10 w-10 text-[var(--primary)]" />
            </div>
          </motion.div>
          <h2 className="heading-font text-4xl md:text-5xl lg:text-6xl text-[var(--primary)] mb-6">
            Ready to Transform Education?
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed">
            Join us in creating an inclusive learning environment. Start monitoring and empowering your students today.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => onNavigateToLogin()}
              size="lg"
              className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--accent-foreground)] text-xl px-12 py-7 h-auto shadow-2xl hover:shadow-[var(--accent)]/30 transition-all font-bold group"
            >
              Get Started
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--primary)] text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6">
                <Logo size="md" showText={true} variant="light" />
              </div>
              <p className="text-white/80 leading-relaxed">
                A comprehensive monitoring and reporting dashboard for inclusive mathematics education.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="font-bold text-lg mb-4">Academic Context</h4>
              <p className="text-white/80 text-sm leading-relaxed">
                Developed as part of the Senyamatika project — an innovative mobile application designed to teach Functional Mathematics to Deaf and SPED students through accessible, engaging learning experiences.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3 text-white/80">
                <li>
                  <button 
                    onClick={() => onNavigateToLogin()} 
                    className="hover:text-white transition-colors hover:translate-x-1 inline-flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    Login to Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigateToLogin('teacher')} 
                    className="hover:text-white transition-colors hover:translate-x-1 inline-flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    Teacher Portal
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigateToLogin('admin')} 
                    className="hover:text-white transition-colors hover:translate-x-1 inline-flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    Admin Portal
                  </button>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="border-t border-white/20 pt-8 text-center text-sm text-white/60 space-y-1"
          >
            <p>© 2026 SenyamatiKard.</p>
            <p>All rights reserved. Team Senyamatika.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}