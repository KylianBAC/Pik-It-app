import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

export default function AnnotatedImagePage({ route, navigation }) {
  const { imageUri, detections, objectToPhotograph } = route.params;

  const [objectDetected, setObjectDetected] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 1,
    height: 1,
    displayWidth: 1,
    displayHeight: 1,
  });
  const [selectedDetection, setSelectedDetection] = useState(null);
  const screenWidth = Dimensions.get("window").width;
  const [showDetections, setShowDetections] = useState(false);

  useEffect(() => {
    Image.getSize(
      imageUri,
      (width, height) => {
        const scaledHeight = (screenWidth / width) * height;
        setImageDimensions({
          width,
          height,
          displayWidth: screenWidth,
          displayHeight: scaledHeight,
        });
      },
      (error) => console.error("Erreur lors du chargement de l'image :", error)
    );
  }, [imageUri]);

  // Vérifie si l'objet du jour est détecté parmi les objets
  useEffect(() => {
    const found = detections.some(
      (d) => d.object_name === objectToPhotograph
    );
    setObjectDetected(found);
  }, [detections, objectToPhotograph]);

  const getScaledCoordinates = (box) => {
    // box = [x1, y1, x2, y2]
    console.log(imageDimensions.width);
    console.log(imageDimensions.height);
    const scaleX = imageDimensions.displayWidth / 3060;
    const scaleY = imageDimensions.displayHeight / 4048;
    const [x1, y1, x2, y2] = box;
    return [x1 * scaleX, y1 * scaleY, x2 * scaleX, y2 * scaleY];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Annotée</Text>

      <View
        style={{
          width: imageDimensions.displayWidth,
          height: imageDimensions.displayHeight,
        }}
      >
        <Image
          source={{ uri: imageUri }}
          style={[
            styles.image,
            {
              width: imageDimensions.displayWidth,
              height: imageDimensions.displayHeight,
            },
          ]}
        />

        {imageDimensions.displayWidth > 1 &&
          imageDimensions.displayHeight > 1 && (
            <Svg
              width={imageDimensions.displayWidth}
              height={imageDimensions.displayHeight}
              style={styles.svg}
            >
              {detections.map((detection, index) => {
                const [x1, y1, x2, y2] =
                  getScaledCoordinates(detection.bbox.box);
                const isTarget =
                  detection.object_name === objectToPhotograph;
                return (
                  <React.Fragment key={index}>
                    <Rect
                      x={x1}
                      y={y1}
                      width={x2 - x1}
                      height={y2 - y1}
                      stroke={
                        isTarget
                          ? "green"
                          : selectedDetection === index
                          ? "yellow"
                          : "red"
                      }
                      strokeWidth={isTarget || selectedDetection === index ? 4 : 2}
                      fill="none"
                    />
                    <SvgText
                      x={x1}
                      y={Math.max(y1 - 5, 15)}
                      fontSize="14"
                      fill="red"
                      fontWeight="bold"
                    >
                      {`${detection.object_name} (${(
                        detection.confidence * 100
                      ).toFixed(1)}%)`}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          )}
      </View>

      {objectDetected ? (
        <Text style={styles.success}>
          ✅ Bravo ! {objectToPhotograph} détecté !
        </Text>
      ) : (
        <>
          <Text style={styles.error}>
            ❌ {objectToPhotograph} non détecté.
          </Text>
          <Button title="Réessayer" onPress={() => navigation.goBack()} />
        </>
      )}

      <Button
        title={showDetections ? "Masquer les objets" : "Voir les objets détectés"}
        onPress={() => setShowDetections(!showDetections)}
      />

      {showDetections && (
        <FlatList
          data={detections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => setSelectedDetection(index)}>
              <View
                style={[
                  styles.listItem,
                  selectedDetection === index && styles.selectedItem,
                ]}
              >
                <Text style={styles.objectName}>{item.object_name}</Text>
                <Text style={styles.probability}>
                  {(item.confidence * 100).toFixed(1)}%
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  image: {
    backgroundColor: "#eee",
    alignSelf: "center",
  },
  svg: { position: "absolute", top: 0, left: 0 },
  success: { color: "green", fontSize: 12, marginTop: 8 },
  error: { color: "red", fontSize: 12, marginTop: 8 },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginHorizontal: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 5,
    marginTop: 5,
    width: "90%",
  },
  selectedItem: { backgroundColor: "#ffd700" },
  objectName: { fontSize: 16, fontWeight: "bold" },
  probability: { fontSize: 14, color: "green" },
});
