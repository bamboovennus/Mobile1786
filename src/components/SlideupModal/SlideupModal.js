import React, { useEffect, useState } from 'react'
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  View,
  Keyboard,
} from 'react-native'

const SlideupModal = ({
  isShow,
  setShow,
  children,
  modalContentStyle,
  title,
  onSave,
  onCancel,
}) => {
  const onModalClose = () => {
    onCancel && onCancel()
    setShow(false)
  }

  return (
    <View style={(styles.centeredView, { zIndex: 0 })}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isShow}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.')
        }}
      >
        <View behavior={'padding'} style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.actionHeader}>
              <TouchableOpacity onPress={() => onModalClose()}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onModalClose()}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalContentContainer}>
              <Text style={styles.modalTitle}>{title}</Text>
              <View style={modalContentStyle}>{children}</View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: 22,
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 100,
  },
  actionHeader: {
    flex: 2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#cfd0d1',
    borderBottomWidth: 0.5,
  },
  modalView: {
    marginBottom: 22,
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 0,
    shadowColor: '#000',
    height: '40%',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    width: '100%',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    height: 40,
  },
  modalContentContainer: {
    flex: 8,
    marginTop: 20,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalTitle: {
    textAlign: 'left',
    fontWeight: '600',
    fontSize: 16,
  },
  doneText: {
    fontWeight: '700',
    color: '#034aff',
  },
})

export default SlideupModal
