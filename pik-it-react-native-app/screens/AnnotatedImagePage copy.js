import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

export default function AnnotatedImagePage({ route }) {
  const { imageUri, detections } = route.params;
  const [imageDimensions, setImageDimensions] = useState({
    width: 1,
    height: 1,
  });
  const [selectedDetection, setSelectedDetection] = useState(null);
  const screenWidth = Dimensions.get("window").width;

  // Charger les dimensions de l'image pour adapter les annotations
  useEffect(() => {
    Image.getSize(imageUri, (width, height) => {
      const scaledHeight = (screenWidth / width) * height;
      console.log("📷 Image originale :", width, "x", height);
      console.log("📱 Image affichée :", screenWidth, "x", scaledHeight);
      setImageDimensions({
        width,
        height,
        displayWidth: screenWidth,
        displayHeight: scaledHeight,
      });
    });
  }, [imageUri]);
  console.log("📌 Détections reçues :", detections);
  detections.forEach((detection, index) => {
    console.log(`Objet ${index + 1} - ${detection.name} :`, detection.box);
  });
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Annotée</Text>

      {/* Conteneur pour l'image et les annotations */}
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

        {/* Dessin des annotations */}
        <Svg
          width={imageDimensions.displayWidth}
          height={imageDimensions.displayHeight}
          style={styles.svg}
        >
          {detections.map((detection, index) => {
            const { box, name, score } = detection;
            const [x1, y1, x2, y2] = box;

            // Adapter les coordonnées à la taille affichée
            const scaleX = imageDimensions.displayWidth / imageDimensions.width;
            const scaleY =
              imageDimensions.displayHeight / imageDimensions.height;

            return (
              <React.Fragment key={index}>
                {/* Dessiner la boîte de sélection */}
                <Rect
                  x={x1 * scaleX}
                  y={y1 * scaleY}
                  width={(x2 - x1) * scaleX}
                  height={(y2 - y1) * scaleY}
                  stroke={selectedDetection === index ? "yellow" : "red"}
                  strokeWidth={selectedDetection === index ? 4 : 2}
                  fill="none"
                />
                {/* Affichage du texte */}
                <SvgText
                  x={x1 * scaleX}
                  y={y1 * scaleY - 5}
                  fontSize="14"
                  fill="red"
                  fontWeight="bold"
                >
                  {`${name} (${(score * 100).toFixed(1)}%)`}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      <Text style={styles.listTitle}>Objets détectés :</Text>

      {/* Liste des objets détectés */}
      <FlatList
        data={detections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => setSelectedDetection(index)}>
            <View
              style={[
                styles.listItem,
                selectedDetection === index && styles.selectedItem,
              ]}
            >
              <Text style={styles.objectName}>{item.name}</Text>
              <Text style={styles.probability}>
                {(item.score * 100).toFixed(1)}%
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  image: {
    backgroundColor: "#eee",
    alignSelf: "center",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
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
  selectedItem: {
    backgroundColor: "#ffd700",
  },
  objectName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  probability: {
    fontSize: 16,
    color: "green",
  },
});
