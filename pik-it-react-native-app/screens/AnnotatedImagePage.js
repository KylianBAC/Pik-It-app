import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { XCircle, CheckCircle, Gift } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOP_PADDING = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

export default function AnnotatedImagePage({ route, navigation }) {
  const { imageUri, detections, objectToPhotograph, challengeId } = route.params;
  const [detected, setDetected] = useState(false);
  const [dims, setDims] = useState({ w: 0, h: 0, dw: 0, dh: 0 });
  const imageSizeRatio = 0.8;
  const [selected, setSelected] = useState(null);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    Image.getSize(
      imageUri,
      (w, h) => {
        const dw = SCREEN_WIDTH;
        const dh = (h / w) * SCREEN_WIDTH;
        setDims({ w, h, dw, dh });
      },
      console.error
    );
  }, [imageUri]);

  useEffect(() => {
    setDetected(
      detections.some((d) => d.object_name === objectToPhotograph)
    );
  }, [detections, objectToPhotograph]);

  const scaleCoords = ([x1, y1, x2, y2]) => {
    const sx = dims.dw / dims.w;
    const sy = dims.dh / dims.h;
    return [x1 * sx * imageSizeRatio, y1 * sy * imageSizeRatio, x2 * sx * imageSizeRatio, y2 * sy * imageSizeRatio];
  };

  const handleMainButtonPress = () => {
    if (detected) {
      // Naviguer vers la page de récompense
      navigation.navigate('RewardScreen', {
        objectToPhotograph,
        challengeId,
        imageUri
      });
    } else {
      // Retourner à la caméra pour réessayer
      navigation.goBack();
    }
  };

  // Wait until dimensions are calculated
  if (dims.dw === 0 || dims.dh === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color="#EF4444" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <XCircle size={28} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Image Annotée</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={[styles.imageWrapper, { width: dims.dw * imageSizeRatio, height: dims.dh * imageSizeRatio }]}>  
        <Image
          source={{ uri: imageUri }}
          style={{ width: dims.dw * imageSizeRatio, height: dims.dh * imageSizeRatio }}
          resizeMode="contain"
        />
        <Svg width={dims.dw} height={dims.dh} style={StyleSheet.absoluteFill}>
          {detections.map((d, i) => {
            const [x1, y1, x2, y2] = scaleCoords(d.bbox.box);
            const isTarget = d.object_name === objectToPhotograph;
            return (
              <React.Fragment key={i}>
                <Rect
                  x={x1}
                  y={y1}
                  width={x2 - x1}
                  height={y2 - y1}
                  stroke={isTarget ? "#10B981" : selected === i ? "#FBBF24" : "#EF4444"}
                  strokeWidth={isTarget || selected === i ? 3 : 2}
                  fill="none"
                />
                <SvgText
                  x={x1}
                  y={y1 - 6}
                  fontSize="12"
                  fill={isTarget ? "#10B981" : "#EF4444"}
                  fontWeight="600"
                >
                  {`${d.object_name} ${(d.confidence * 100).toFixed(0)}%`}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      <View style={styles.statusRow}>
        {detected ? (
          <CheckCircle size={22} color="#10B981" />
        ) : (
          <XCircle size={22} color="#EF4444" />
        )}
        <Text style={[styles.statusText, detected ? styles.success : styles.error]}>  
          {detected
            ? `Bravo ! ${objectToPhotograph} détecté !`
            : `Dommage, ${objectToPhotograph} non détecté.`}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, detected ? styles.successButton : styles.retryButton]}
        onPress={handleMainButtonPress}
      >
        <View style={styles.buttonContent}>
          {detected && <Gift size={20} color="#FFF" style={styles.buttonIcon} />}
          <Text style={styles.buttonText}>
            {detected ? "Obtenir la récompense" : "Réessayer"}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.toggleButton]}
        onPress={() => setShowList((v) => !v)}
      >
        <Text style={styles.buttonText}>
          {showList ? "Masquer résultats" : "Voir tous"}
        </Text>
      </TouchableOpacity>

      {showList && (
        <View style={styles.listContainer}>
          <FlatList
            data={detections}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => setSelected(index)}>
                <View
                  style={[
                    styles.listItem,
                    selected === index && styles.listItemActive,
                  ]}
                >
                  <Text style={styles.itemName}>{item.object_name}</Text>
                  <Text style={styles.itemConf}>
                    {(item.confidence * 100).toFixed(0)}%
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: TOP_PADDING + 12,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  imageWrapper: {
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#DDD',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  success: {
    color: '#10B981',
  },
  error: {
    color: '#EF4444',
  },
  button: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 12,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  retryButton: {
    backgroundColor: '#EF4444',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  toggleButton: {
    backgroundColor: '#374151',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemActive: {
    backgroundColor: '#FEF3C7',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemConf: {
    fontSize: 14,
    color: '#6B7280',
  },
});