import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, type EasingFunction } from 'react-native';

interface Params {
  visible: boolean;
  translateY?: { from: number; to: number };
  inDuration?: number;
  outDuration?: number;
  easingIn?: EasingFunction;
  easingOut?: EasingFunction;
  fadeOffset?: number;
  onClosed?: () => void;
}

interface Response {
  open: boolean;
  backdropStyle: { opacity: Animated.Value };
  cardStyle: { transform: { translateY: Animated.Value }[]; opacity: Animated.Value };
  fade: Animated.Value;
  translate: Animated.Value;
}

const defaults = {
  translateY: { from: 20, to: 0 },
  inDuration: 220,
  outDuration: 180,
  easingIn: Easing.out(Easing.quad),
  easingOut: Easing.in(Easing.quad),
  fadeOffset: 60,
} as const;

const useInOutAnimation = (props: Params): Response => {
  const cfg = useMemo(() => ({ ...defaults, ...props }), [props]);

  const [open, setOpen] = useState(cfg.visible);
  const translate = useRef(new Animated.Value(cfg.translateY.from)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!cfg.visible) translate.setValue(cfg.translateY.from);
  }, [cfg.translateY.from, cfg.visible, translate]);

  useEffect(() => {
    translate.stopAnimation();
    fade.stopAnimation();

    if (cfg.visible) {
      if (!open) setOpen(true);
      Animated.parallel([
        Animated.timing(translate, {
          toValue: cfg.translateY.to,
          duration: cfg.inDuration,
          easing: cfg.easingIn,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: Math.max(0, cfg.inDuration - cfg.fadeOffset),
          easing: cfg.easingIn,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (open) {
      Animated.parallel([
        Animated.timing(translate, {
          toValue: cfg.translateY.from,
          duration: cfg.outDuration,
          easing: cfg.easingOut,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0,
          duration: Math.max(0, cfg.outDuration - cfg.fadeOffset),
          easing: cfg.easingOut,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setOpen(false);
          cfg.onClosed?.();
        }
      });
    }
  }, [cfg, open, translate, fade]);

  return {
    open,
    fade,
    translate,
    backdropStyle: { opacity: fade },
    cardStyle: { transform: [{ translateY: translate }], opacity: fade },
  };
};

export { useInOutAnimation };
